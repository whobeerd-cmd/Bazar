"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, logAdminAction } from "@/lib/auth/admin";
import type { AuthActionState } from "@/lib/actions/auth";

const bannerSchema = z.object({
  imageUrl: z.string().url("Сначала загрузите картинку"),
  linkUrl: z.string().trim().optional(),
  position: z.enum(["home_top", "home_middle", "sidebar"]),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export async function createBannerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = bannerSchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    linkUrl: formData.get("linkUrl") || undefined,
    position: formData.get("position"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { data, error } = await supabase
    .from("banners")
    .insert({
      image_url: parsed.data.imageUrl,
      link_url: parsed.data.linkUrl || null,
      position: parsed.data.position,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    })
    .select("id")
    .single();

  if (error) return { error: "Ошибка: " + error.message };

  await logAdminAction(supabase, user.id, "create", "banner", data.id, parsed.data);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: "Баннер добавлен" };
}

export async function toggleBannerActiveAction(id: number, isActive: boolean) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase.from("banners").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, isActive ? "activate" : "deactivate", "banner", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBannerAction(id: number) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "delete", "banner", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}
