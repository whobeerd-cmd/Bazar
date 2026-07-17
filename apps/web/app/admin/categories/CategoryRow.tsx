"use client";

import { useState, useTransition } from "react";
import {
  toggleCategoryActiveAction,
  deleteCategoryAction,
} from "@/lib/actions/admin/categories";
import { CategoryForm } from "./CategoryForm";

type Category = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  parentName?: string;
};

export function CategoryRow({
  category,
  parentOptions,
}: {
  category: Category;
  parentOptions: { id: number; name: string }[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isEditing) {
    return (
      <tr className="border-b border-border">
        <td colSpan={5} className="p-3">
          <CategoryForm
            mode="edit"
            category={category}
            parentOptions={parentOptions}
            onSuccess={() => setIsEditing(false)}
          />
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="mt-2 text-xs text-muted-foreground underline"
          >
            Отмена
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border text-sm">
      <td className="p-3">
        {category.parentName && (
          <span className="mr-1 text-muted-foreground">{category.parentName} /</span>
        )}
        {category.name}
      </td>
      <td className="p-3 text-muted-foreground">{category.slug}</td>
      <td className="p-3 text-muted-foreground">{category.sort_order}</td>
      <td className="p-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await toggleCategoryActiveAction(category.id, !category.is_active);
              if (result?.error) setError(result.error);
            })
          }
          className={`rounded-full px-2 py-0.5 text-xs ${
            category.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
          }`}
        >
          {category.is_active ? "активна" : "скрыта"}
        </button>
      </td>
      <td className="p-3 text-right">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="mr-3 text-xs underline"
        >
          Изменить
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm(`Удалить категорию "${category.name}"?`)) return;
            startTransition(async () => {
              const result = await deleteCategoryAction(category.id);
              if (result?.error) setError(result.error);
            });
          }}
          className="text-xs text-red-600 underline"
        >
          Удалить
        </button>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </td>
    </tr>
  );
}
