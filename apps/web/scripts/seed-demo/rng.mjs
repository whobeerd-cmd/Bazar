// Небольшие рандомизирующие хелперы, общие для всех модулей.

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.name;
  }
  return items[items.length - 1].name;
}

export function intBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundPrice(value) {
  if (value < 1000) return Math.round(value / 10) * 10;
  if (value < 20000) return Math.round(value / 100) * 100;
  return Math.round(value / 500) * 500;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
