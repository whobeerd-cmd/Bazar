export function formatPrice(priceType: string, price: number | null) {
  if (priceType === "negotiable") return "Договорная";
  if (priceType === "free") return "Бесплатно";
  return `${(price ?? 0).toLocaleString("ru-RU")} ₽`;
}
