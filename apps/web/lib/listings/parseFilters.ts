import type { ListingFilters, ListingSort } from "./query";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListingFilters(searchParams: RawSearchParams): ListingFilters {
  const sort = first(searchParams.sort);
  const condition = first(searchParams.condition);
  const priceMin = first(searchParams.price_min);
  const priceMax = first(searchParams.price_max);
  const city = first(searchParams.city);
  const page = first(searchParams.page);

  return {
    search: first(searchParams.q) || undefined,
    cityId: city ? Number(city) : undefined,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    condition: condition === "new" || condition === "used" ? condition : undefined,
    hasPhoto: first(searchParams.has_photo) === "1",
    hasVideo: first(searchParams.has_video) === "1",
    vipOnly: first(searchParams.vip) === "1",
    sort: (sort === "price_asc" || sort === "price_desc" ? sort : "newest") as ListingSort,
    page: page ? Number(page) : 1,
  };
}

// Плоское представление searchParams для построения ссылок пагинации
export function flattenSearchParams(searchParams: RawSearchParams): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    result[key] = first(value);
  }
  return result;
}
