import { CATEGORY_CONFIG } from "./config.mjs";
import { serviceClient } from "./supabaseClients.mjs";
import { logger } from "./logger.mjs";

// Конечные категории сайта (без детей) — именно в них реально попадают
// объявления. Сопоставляем с CATEGORY_CONFIG по slug; для того, чего нет в
// конфиге, используем нейтральный fallback вместо падения скрипта.
export async function getLeafCategories() {
  const { data: categories, error } = await serviceClient
    .from("categories")
    .select("id, parent_id, name, slug, show_condition, show_deal_type, requires_photo");

  if (error) throw new Error(`Не удалось получить категории: ${error.message}`);

  const parentIds = new Set(categories.filter((c) => c.parent_id !== null).map((c) => c.parent_id));
  const leaves = categories.filter((c) => !parentIds.has(c.id));

  return leaves.map((category) => {
    const config = CATEGORY_CONFIG[category.slug];
    if (!config) {
      logger.warn(`Нет конфига для категории "${category.name}" (${category.slug}) — использую fallback "Разное"`);
    }
    return {
      ...category,
      config: config ?? CATEGORY_CONFIG["raznoe"],
    };
  });
}

export async function getCities() {
  const { data, error } = await serviceClient.from("cities").select("id, name");
  if (error) throw new Error(`Не удалось получить города: ${error.message}`);
  return data;
}
