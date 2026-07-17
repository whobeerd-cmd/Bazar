"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, logAdminAction } from "@/lib/auth/admin";
import type { AuthActionState } from "@/lib/actions/auth";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Название должно быть не короче 2 символов"),
  slug: z
    .string()
    .trim()
    .min(2, "ЧПУ-адрес должен быть не короче 2 символов")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Только латиница, цифры и дефис, например: nedvizhimost"),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createCategoryAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    parentId: formData.get("parentId") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      parent_id: parsed.data.parentId ? Number(parsed.data.parentId) : null,
      sort_order: parsed.data.sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    return {
      error: error.code === "23505" ? "Такой ЧПУ-адрес уже занят" : "Ошибка: " + error.message,
    };
  }

  await logAdminAction(supabase, user.id, "create", "category", data.id, parsed.data);
  revalidatePath("/admin/categories");
  return { success: "Категория создана" };
}

export async function updateCategoryAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { supabase, user } = await requireAdmin();

  const id = Number(formData.get("id"));
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    parentId: formData.get("parentId") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!id || !parsed.success) {
    return { error: parsed.success ? "Некорректный id" : parsed.error.issues[0]?.message };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      parent_id: parsed.data.parentId ? Number(parsed.data.parentId) : null,
      sort_order: parsed.data.sortOrder,
    })
    .eq("id", id);

  if (error) {
    return {
      error: error.code === "23505" ? "Такой ЧПУ-адрес уже занят" : "Ошибка: " + error.message,
    };
  }

  await logAdminAction(supabase, user.id, "update", "category", id, parsed.data);
  revalidatePath("/admin/categories");
  return { success: "Категория обновлена" };
}

export async function toggleCategoryActiveAction(id: number, isActive: boolean) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, isActive ? "activate" : "deactivate", "category", id);
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: number) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Нельзя удалить: у категории есть подкатегории или объявления"
          : error.message,
    };
  }

  await logAdminAction(supabase, user.id, "delete", "category", id);
  revalidatePath("/admin/categories");
  return { success: true };
}
