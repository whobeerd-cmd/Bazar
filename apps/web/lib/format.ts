export function formatPrice(priceType: string, price: number | null) {
  if (priceType === "negotiable") return "Договорная";
  if (priceType === "free") return "Бесплатно";
  return `${(price ?? 0).toLocaleString("ru-RU")} ₽`;
}

const DEAL_TYPE_LABELS: Record<string, string> = {
  sale: "Продам",
  rent_out: "Сдам",
  buy: "Куплю",
  rent_seek: "Сниму",
};

export function formatDealType(dealType: string | null) {
  return dealType ? DEAL_TYPE_LABELS[dealType] ?? null : null;
}

export function buildWhatsAppLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
