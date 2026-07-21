import { logger } from "./logger.mjs";

// Оборачивает шаг импорта так, чтобы одна ошибка (сеть, Pexels, конкретная
// категория) не обрывала весь прогон — ошибка логируется и попадает в
// итоговую статистику, скрипт идёт дальше.
export async function attempt(stats, context, fn) {
  try {
    return await fn();
  } catch (error) {
    logger.error(`${context}: ${error.message}`);
    stats.skipped.push({ context, reason: error.message });
    return null;
  }
}
