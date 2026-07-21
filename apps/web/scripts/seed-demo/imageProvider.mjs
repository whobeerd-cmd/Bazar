import "./loadEnv.mjs";
import { SETTINGS } from "./config.mjs";
import { sleep } from "./rng.mjs";
import { logger } from "./logger.mjs";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  throw new Error(
    "Не найден PEXELS_API_KEY. Получите бесплатный ключ на https://www.pexels.com/api/ и добавьте PEXELS_API_KEY=... в apps/web/.env.local"
  );
}

// Один поиск на категорию (не на объявление) — экономим лимит запросов
// Pexels (200/час на бесплатном тарифе). count — сколько РАЗНЫХ фото нужно
// набрать (столько, чтобы хватило на все объявления категории без повторов,
// см. importer.mjs). Возвращает массив прямых URL фото — сами файлы
// скачиваются и перезаливаются к нам отдельным модулем (storageUploader),
// хотлинков не остаётся.
export async function searchCategoryImages(query, count = SETTINGS.imagesPerCategoryPool) {
  const perPage = Math.min(80, Math.max(1, count));
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;

  const response = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!response.ok) {
    throw new Error(`Pexels API вернул ${response.status} для запроса "${query}"`);
  }

  const data = await response.json();
  await sleep(SETTINGS.requestDelayMs);

  const urls = (data.photos ?? []).map((photo) => photo.src.large);
  if (urls.length === 0) {
    logger.warn(`Pexels не нашёл фото по запросу "${query}"`);
  }
  return urls;
}

export async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Не удалось скачать изображение ${url}: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
