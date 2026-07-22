import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type BusinessSort = "rating" | "newest";

export type BusinessFilters = {
  categoryId?: number;
  cityId?: number;
  search?: string;
  sort?: BusinessSort;
  page?: number;
  pageSize?: number;
};

export type BusinessCard = {
  id: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  is_featured: boolean;
  city_name: string | null;
  category_name: string | null;
};

// Общий построитель запроса бизнесов — используется витриной и страницей категории.
export async function queryBusinesses(supabase: Supabase, filters: BusinessFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("businesses")
    .select(
      "id, name, slug, cover_image_url, rating_avg, rating_count, is_verified, is_featured, cities(name), business_categories(name)",
      { count: "exact" }
    )
    .eq("status", "active");

  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.cityId) query = query.eq("city_id", filters.cityId);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("rating_avg", { ascending: false });
  }

  const { data, count, error } = await query.range(from, to);

  const items: BusinessCard[] = (data ?? []).map((row: any) => {
    const city = Array.isArray(row.cities) ? row.cities[0] : row.cities;
    const category = Array.isArray(row.business_categories) ? row.business_categories[0] : row.business_categories;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      cover_image_url: row.cover_image_url,
      rating_avg: Number(row.rating_avg),
      rating_count: row.rating_count,
      is_verified: row.is_verified,
      is_featured: row.is_featured,
      city_name: city?.name ?? null,
      category_name: category?.name ?? null,
    };
  });

  return { items, count: count ?? 0, page, pageSize, error };
}

export async function getBusinessCategories(supabase: Supabase) {
  const { data } = await supabase
    .from("business_categories")
    .select("id, name, slug, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}
