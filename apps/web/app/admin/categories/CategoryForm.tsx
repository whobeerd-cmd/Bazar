"use client";

import { useActionState, useEffect } from "react";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions/admin/categories";
import type { AuthActionState } from "@/lib/actions/auth";

type CategoryOption = { id: number; name: string };

export function CategoryForm({
  mode,
  category,
  parentOptions,
  onSuccess,
}: {
  mode: "create" | "edit";
  category?: {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    sort_order: number;
  };
  parentOptions: CategoryOption[];
  onSuccess?: () => void;
}) {
  const action = mode === "create" ? createCategoryAction : updateCategoryAction;
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    action,
    null
  );

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-end"
    >
      {mode === "edit" && category && <input type="hidden" name="id" value={category.id} />}

      <div className="sm:col-span-2">
        <label className="field-label">Название</label>
        <input
          name="name"
          defaultValue={category?.name}
          required
          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="sm:col-span-1">
        <label className="field-label">ЧПУ-адрес (slug)</label>
        <input
          name="slug"
          defaultValue={category?.slug}
          placeholder="nedvizhimost"
          required
          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="sm:col-span-1">
        <label className="field-label">Родительская</label>
        <select
          name="parentId"
          defaultValue={category?.parent_id ?? ""}
          className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
        >
          <option value="">— верхний уровень —</option>
          {parentOptions
            .filter((option) => option.id !== category?.id)
            .map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
        </select>
      </div>

      <div className="sm:col-span-1 flex items-end gap-2">
        <div className="flex-1">
          <label className="field-label">Порядок</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={category?.sort_order ?? 0}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary shrink-0 py-1.5"
        >
          {isPending ? "..." : mode === "create" ? "Добавить" : "Сохранить"}
        </button>
      </div>

      {state?.error && (
        <p className="sm:col-span-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="sm:col-span-5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}
    </form>
  );
}
