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
        <label className="text-xs font-medium text-muted-foreground">Название</label>
        <input
          name="name"
          defaultValue={category?.name}
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </div>

      <div className="sm:col-span-1">
        <label className="text-xs font-medium text-muted-foreground">ЧПУ-адрес (slug)</label>
        <input
          name="slug"
          defaultValue={category?.slug}
          placeholder="nedvizhimost"
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </div>

      <div className="sm:col-span-1">
        <label className="text-xs font-medium text-muted-foreground">Родительская</label>
        <select
          name="parentId"
          defaultValue={category?.parent_id ?? ""}
          className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
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
          <label className="text-xs font-medium text-muted-foreground">Порядок</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={category?.sort_order ?? 0}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "..." : mode === "create" ? "Добавить" : "Сохранить"}
        </button>
      </div>

      {state?.error && (
        <p className="sm:col-span-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="sm:col-span-5 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.success}
        </p>
      )}
    </form>
  );
}
