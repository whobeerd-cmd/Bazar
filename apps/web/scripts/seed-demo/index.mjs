import { runImport } from "./importer.mjs";
import { logger } from "./logger.mjs";

const startedAt = Date.now();

runImport()
  .then((stats) => {
    const minutes = ((Date.now() - startedAt) / 60000).toFixed(1);
    logger.step("Итоговая статистика");
    logger.info(`Категорий обработано: ${stats.categoriesProcessed}`);
    logger.info(`Объявлений импортировано: ${stats.listingsCreated}`);
    logger.info(`Изображений скачано: ${stats.imagesDownloaded}`);
    logger.info(`Demo-профилей создано: ${stats.profilesCreated}`);
    logger.info(`Время выполнения: ${minutes} мин.`);

    if (stats.skipped.length > 0) {
      logger.warn(`Пропущено/ошибок: ${stats.skipped.length}`);
      for (const { context, reason } of stats.skipped.slice(0, 30)) {
        logger.warn(`  — ${context}: ${reason}`);
      }
      if (stats.skipped.length > 30) {
        logger.warn(`  ...и ещё ${stats.skipped.length - 30}`);
      }
    } else {
      logger.info("Пропусков и ошибок нет.");
    }

    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Критическая ошибка, скрипт остановлен: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
