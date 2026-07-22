import { randomUUID } from "node:crypto";
import { SETTINGS, CITY_WEIGHTS } from "./config.mjs";
import { pickWeighted, intBetween, sleep } from "./rng.mjs";
import { logger } from "./logger.mjs";
import { attempt } from "./errorHandler.mjs";
import { getLeafCategories, getCities } from "./categoryMapper.mjs";
import { generateListingContent } from "./contentGenerator.mjs";
import { createDemoProfile } from "./demoUserCreator.mjs";
import { searchCategoryImages, downloadImage } from "./imageProvider.mjs";
import { uploadImageToStorage } from "./storageUploader.mjs";
import { countExistingDemoListings } from "./dedupe.mjs";
import { serviceClient, ensureSeedBot } from "./supabaseClients.mjs";

function randomBackdate() {
  const daysAgo = intBetween(SETTINGS.backdateDays.min, SETTINGS.backdateDays.max);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(intBetween(8, 22), intBetween(0, 59), 0, 0);
  return date.toISOString();
}

// Скачивает count фото по запросу query один раз — используется и для
// общего пула категории, и для пула конкретного товара (itemPexels).
async function fetchImagePool(query, count, stats, label) {
  const urls = await attempt(stats, `Поиск фото для "${label}"`, () => searchCategoryImages(query, count));
  if (!urls || urls.length === 0) return [];

  const pool = [];
  for (const url of urls) {
    const uploaded = await attempt(stats, `Скачивание фото для "${label}"`, async () => {
      const buffer = await downloadImage(url);
      stats.imagesDownloaded += 1;
      return buffer;
    });
    if (uploaded) pool.push(uploaded);
    await sleep(SETTINGS.requestDelayMs);
  }
  return pool;
}

// Пул фото под конкретный товар внутри категории (если задан itemPexels) —
// собирается лениво, при первом объявлении с этим товаром, и кэшируется на
// случай, если товар выпадет снова у другого объявления той же категории.
// Так фото гарантированно соответствует тексту (щенок — а не баран).
async function getPoolForItem({ category, itemName, itemPoolCache, toCreate, stats }) {
  const itemPexels = category.config.itemPexels;
  if (!itemPexels) return null; // категория без per-item фото — вызывающий код использует общий пул

  if (!itemPoolCache.has(itemName)) {
    const expectedUses = Math.max(1, Math.ceil(toCreate / category.config.items.length));
    const size = Math.min(80, expectedUses * SETTINGS.imagesPerListing.max + 2);
    const query = itemPexels[itemName] ?? category.config.pexels;
    const pool = await fetchImagePool(query, size, stats, `${category.name} — ${itemName}`);
    itemPoolCache.set(itemName, pool);
  }
  return itemPoolCache.get(itemName);
}

async function createOneListing({ category, cities, categoryPool, itemPoolCache, toCreate, seedBotClient, stats }) {
  const profile = await attempt(stats, `Создание demo-профиля для "${category.name}"`, createDemoProfile);
  if (!profile) return;
  stats.profilesCreated += 1;

  const content = generateListingContent(category);
  const cityName = pickWeighted(CITY_WEIGHTS);
  const city = cities.find((c) => c.name === cityName) ?? cities[0];
  const listingId = randomUUID();
  const backdate = randomBackdate();
  const isVip = Math.random() < SETTINGS.vipChance;

  const inserted = await attempt(stats, `Вставка объявления "${content.title}"`, async () => {
    const { error } = await serviceClient.from("listings").insert({
      id: listingId,
      user_id: profile.id,
      category_id: category.id,
      city_id: city.id,
      title: content.title,
      description: content.description,
      price: content.price,
      price_type: content.priceType,
      condition: content.condition,
      deal_type: content.dealType,
      status: "active", // триггер всё равно опустит до draft для service_role — поднимаем ниже через seed-bot
      is_vip: isVip,
      created_at: backdate,
      sort_priority: backdate,
    });
    if (error) throw new Error(error.message);
    return true;
  });
  if (!inserted) return;

  // Публикуем через seed-bot (роль moderator) — только staff может выставить active.
  await attempt(stats, `Публикация объявления "${content.title}"`, async () => {
    const { error } = await seedBotClient
      .from("listings")
      .update({ status: "active" })
      .eq("id", listingId);
    if (error) throw new Error(error.message);
  });

  if (category.requires_photo) {
    const pool =
      (await getPoolForItem({ category, itemName: content.item, itemPoolCache, toCreate, stats })) ??
      categoryPool;

    if (pool && pool.length > 0) {
      const photoCount = Math.min(pool.length, intBetween(SETTINGS.imagesPerListing.min, SETTINGS.imagesPerListing.max));
      // Забираем фото из пула безвозвратно (splice) — так одно и то же фото не
      // достаётся двум разным объявлениям.
      const chosen = pool.splice(0, photoCount);

      for (let i = 0; i < chosen.length; i += 1) {
        await attempt(stats, `Загрузка фото объявления "${content.title}"`, async () => {
          const url = await uploadImageToStorage({
            buffer: chosen[i],
            userId: profile.id,
            listingId,
            index: i,
          });
          const { error } = await serviceClient
            .from("listing_images")
            .insert({ listing_id: listingId, url, sort_order: i });
          if (error) throw new Error(error.message);
        });
      }
    }
  }

  stats.listingsCreated += 1;
}

export async function runImport() {
  const stats = {
    categoriesProcessed: 0,
    listingsCreated: 0,
    imagesDownloaded: 0,
    profilesCreated: 0,
    skipped: [],
  };

  logger.step("Настройка seed-bot (нужен для публикации объявлений)");
  const { seedBotClient } = await ensureSeedBot();

  logger.step("Загрузка категорий и городов");
  let categories = await getLeafCategories();
  const cities = await getCities();
  logger.info(`Найдено ${categories.length} конечных категорий, ${cities.length} городов`);

  // Только для отладки: SEED_DEMO_ONLY=slug1,slug2 ограничивает прогон
  // конкретными категориями (полезно для быстрой проверки перед полным запуском).
  if (process.env.SEED_DEMO_ONLY) {
    const only = new Set(process.env.SEED_DEMO_ONLY.split(","));
    categories = categories.filter((c) => only.has(c.slug));
    logger.warn(`SEED_DEMO_ONLY активен — обрабатываю только: ${[...only].join(", ")}`);
  }

  for (const category of categories) {
    logger.step(`Категория: ${category.name} (${category.slug})`);

    const alreadyExisting = await attempt(stats, `Проверка существующих demo-объявлений (${category.name})`, () =>
      countExistingDemoListings(category.id)
    );
    const target = intBetween(SETTINGS.listingsPerCategory.min, SETTINGS.listingsPerCategory.max);
    const toCreate = Math.max(0, target - (alreadyExisting ?? 0));

    if (toCreate === 0) {
      logger.info(`Уже достаточно demo-объявлений (${alreadyExisting}) — пропускаю`);
      stats.categoriesProcessed += 1;
      continue;
    }

    // Если у категории заданы per-item запросы (itemPexels), общий пул не
    // нужен — фото собираются отдельно под каждый товар (см. getPoolForItem).
    const usesItemPools = Boolean(category.config.itemPexels);
    const categoryPool =
      category.requires_photo && !usesItemPools
        ? await fetchImagePool(
            category.config.pexels,
            Math.min(80, toCreate * SETTINGS.imagesPerListing.max),
            stats,
            category.name
          )
        : [];
    const itemPoolCache = new Map();

    for (let i = 0; i < toCreate; i += 1) {
      await createOneListing({ category, cities, categoryPool, itemPoolCache, toCreate, seedBotClient, stats });
      logger.info(`  [${i + 1}/${toCreate}] готово`);
    }

    stats.categoriesProcessed += 1;
  }

  return stats;
}
