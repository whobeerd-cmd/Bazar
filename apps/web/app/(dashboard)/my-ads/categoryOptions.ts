import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Строит плоский список категорий с отступом (depth) для select — родители перед детьми.
export async function buildCategoryOptions(supabase: Supabase) {
  const { data } = await supabase
    .from("categories")
    .select("id, parent_id, name, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const rows = data ?? [];
  const byParent = new Map<number | null, typeof rows>();
  for (const row of rows) {
    const key = row.parent_id;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }

  const result: { id: number; name: string; depth: number }[] = [];
  function walk(parentId: number | null, depth: number) {
    for (const row of byParent.get(parentId) ?? []) {
      result.push({ id: row.id, name: row.name, depth });
      walk(row.id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}

export async function getCityOptions(supabase: Supabase) {
  const { data } = await supabase.from("cities").select("id, name").order("name");
  return data ?? [];
}
