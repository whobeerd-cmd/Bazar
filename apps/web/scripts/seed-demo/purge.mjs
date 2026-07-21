// Удаляет ВСЕ demo-данные одной командой: profiles.is_demo = true → удаление
// через auth admin API каскадом сносит profiles → listings → listing_images
// и всё остальное, что ссылается на них (FK ... on delete cascade).
import { serviceClient } from "./supabaseClients.mjs";
import { logger } from "./logger.mjs";

async function purge() {
  logger.step("Поиск demo-профилей");
  const { data: demoProfiles, error } = await serviceClient
    .from("profiles")
    .select("id, full_name")
    .eq("is_demo", true);

  if (error) {
    logger.error(`Не удалось получить demo-профили: ${error.message}`);
    process.exit(1);
  }

  if (!demoProfiles || demoProfiles.length === 0) {
    logger.info("Demo-профилей не найдено — удалять нечего.");
    return;
  }

  logger.info(`Найдено ${demoProfiles.length} demo-профилей — удаляю...`);

  let deleted = 0;
  let failed = 0;
  for (const profile of demoProfiles) {
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(profile.id);
    if (deleteError) {
      logger.error(`Не удалось удалить ${profile.full_name} (${profile.id}): ${deleteError.message}`);
      failed += 1;
    } else {
      deleted += 1;
    }
  }

  logger.step("Готово");
  logger.info(`Удалено профилей: ${deleted}`);
  if (failed > 0) logger.warn(`Не удалось удалить: ${failed}`);
}

purge();
