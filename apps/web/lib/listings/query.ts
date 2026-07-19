import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type ListingSort = "newest" | "price_asc" | "price_desc";

export type ListingFilters = {
  categoryIds?: number[];
  cityId?: number;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: "new" | "used";
  dealType?: "sale" | "rent_out" | "buy" | "rent_seek";
  hasPhoto?: boolean;
  hasVideo?: boolean;
  vipOnly?: boolean;
  sort?: ListingSort;
  page?: number;
  pageSize?: number;
};

export type ListingCard = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  price_type: string;
  deal_type: string | null;
  cover_image_url: string | null;
  is_vip: boolean;
  created_at: string;
  city_name: string | null;
};

// Общий построитель запроса объявлений — используется страницами категории
// и поиска, чтобы фильтры/сортировка/пагинация не дублировались.
export async function queryListings(supabase: Supabase, filters: ListingFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("listings")
    .select(
      "id, title, slug, price, price_type, deal_type, cover_image_url, is_vip, created_at, cities(name)",
      { count: "exact" }
    )
    .eq("status", "active");

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds);
  }
  if (filters.cityId) query = query.eq("city_id", filters.cityId);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.dealType) query = query.eq("deal_type", filters.dealType);
  if (filters.hasPhoto) query = query.not("cover_image_url", "is", null);
  if (filters.hasVideo) query = query.eq("has_video", true);
  if (filters.vipOnly) query = query.eq("is_vip", true);
  if (filters.priceMin !== undefined) query = query.gte("price", filters.priceMin);
  if (filters.priceMax !== undefined) query = query.lte("price", filters.priceMax);
  if (filters.search) {
    query = query.textSearch("search_vector", filters.search, { type: "websearch", config: "russian" });
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    default:
      // sort_priority = created_at при создании, обновляется на "сейчас" при "поднятии" —
      // поднятое объявление всплывает как будто опубликовано заново.
      query = query.order("is_vip", { ascending: false }).order("sort_priority", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);

  const items: ListingCard[] = (data ?? []).map((row: any) => {
    const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      price: row.price,
      price_type: row.price_type,
      deal_type: row.deal_type,
      cover_image_url: row.cover_image_url,
      is_vip: row.is_vip,
      created_at: row.created_at,
      city_name: city?.name ?? null,
    };
  });

  return { items, count: count ?? 0, page, pageSize, error };
}
