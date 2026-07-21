// Простое логирование с уровнями и таймстампом — этого достаточно для
// однократного/редкого запуска seed-скрипта, БД для логов не нужна.

function timestamp() {
  return new Date().toISOString().slice(11, 19);
}

export const logger = {
  info(message, ...rest) {
    console.log(`[${timestamp()}] ${message}`, ...rest);
  },
  warn(message, ...rest) {
    console.warn(`[${timestamp()}] ⚠ ${message}`, ...rest);
  },
  error(message, ...rest) {
    console.error(`[${timestamp()}] ✖ ${message}`, ...rest);
  },
  step(message) {
    console.log(`\n[${timestamp()}] === ${message} ===`);
  },
};
