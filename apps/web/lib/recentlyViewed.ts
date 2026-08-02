import type { ListingCard } from "@/lib/listings/query";

const STORAGE_KEY = "bazar_recently_viewed";
const MAX_ITEMS = 12;

export function trackListingView(item: ListingCard) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed().filter((i) => i.id !== item.id);
    const next = [item, ...existing].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — тихо игнорируем
  }
}

export function getRecentlyViewed(): ListingCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
