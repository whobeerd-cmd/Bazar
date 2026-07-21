import { serviceClient } from "./supabaseClients.mjs";

// Защита от повторного импорта: если категорию уже засеяли раньше (в этом
// или прошлом запуске), не досыпаем её заново до бесконечности — считаем
// только объявления demo-профилей и добираем до нужного количества.
export async function countExistingDemoListings(categoryId) {
  const { count, error } = await serviceClient
    .from("listings")
    .select("id, profiles!listings_user_id_fkey!inner(is_demo)", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("profiles.is_demo", true);

  if (error) throw new Error(`Не удалось проверить существующие demo-объявления: ${error.message}`);
  return count ?? 0;
}
