import { createClient } from "@/lib/supabase/server";

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  showCondition: boolean;
  children: CategoryNode[];
};

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, show_condition")
    .eq("is_active", true)
    .order("sort_order");

  const rows = data ?? [];
  const bySlug = new Map<number, CategoryNode>();
  rows.forEach((row) =>
    bySlug.set(row.id, {
      id: row.id,
      name: row.name,
      slug: row.slug,
      showCondition: row.show_condition,
      children: [],
    })
  );

  const roots: CategoryNode[] = [];
  rows.forEach((row) => {
    const node = bySlug.get(row.id)!;
    const parent = row.parent_id ? bySlug.get(row.parent_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  return roots;
}
