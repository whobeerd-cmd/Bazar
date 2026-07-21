// Мини-загрузчик .env.local — без внешней зависимости dotenv, так как это
// отдельный скрипт, запускаемый напрямую через node, а не через Next.js
// (который .env.local подхватывает сам).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", "..", ".env.local");

try {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
} catch {
  // apps/web/.env.local отсутствует — переменные должны быть заданы иначе
  // (например, экспортированы в окружении перед запуском скрипта).
}
