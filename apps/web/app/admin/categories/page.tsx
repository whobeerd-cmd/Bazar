import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "./CategoryForm";
import { CategoryRow } from "./CategoryRow";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, sort_order, is_active")
    .order("sort_order");

  const list = categories ?? [];
  const nameById = new Map(list.map((c) => [c.id, c.name]));
  const parentOptions = list
    .filter((c) => c.parent_id === null)
    .map((c) => ({ id: c.id, name: c.name }));

  const rows = list.map((c) => ({
    ...c,
    parentName: c.parent_id ? nameById.get(c.parent_id) : undefined,
  }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Категории</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Изменения сразу видны на сайте. Категорию с подкатегориями или объявлениями удалить нельзя.
      </p>

      <div className="card mt-6 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Добавить категорию</p>
        <CategoryForm mode="create" parentOptions={parentOptions} />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Название</th>
              <th className="p-3 font-medium">Slug</th>
              <th className="p-3 font-medium">Порядок</th>
              <th className="p-3 font-medium">Статус</th>
              <th className="p-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((category) => (
              <CategoryRow key={category.id} category={category} parentOptions={parentOptions} />
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Категорий пока нет.</p>
        )}
      </div>
    </div>
  );
}
