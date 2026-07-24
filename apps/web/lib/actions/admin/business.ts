"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, logAdminAction } from "@/lib/auth/admin";
import { businessSchema, parsedBusinessPayload } from "@/lib/business/validation";
import type { AuthActionState } from "@/lib/actions/auth";

export async function adminToggleVerifiedAction(businessId: string, isVerified: boolean) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("businesses").update({ is_verified: isVerified }).eq("id", businessId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, isVerified ? "verify_business" : "unverify_business", "business", businessId);
  revalidatePath("/admin/businesses");
  return { success: true };
}

export async function adminToggleFeaturedAction(businessId: string, isFeatured: boolean) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("businesses").update({ is_featured: isFeatured }).eq("id", businessId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, isFeatured ? "feature_business" : "unfeature_business", "business", businessId);
  revalidatePath("/admin/businesses");
  return { success: true };
}

export async function adminSetBusinessStatusAction(businessId: string, status: "active" | "hidden" | "archived") {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("businesses").update({ status }).eq("id", businessId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, `set_status_${status}`, "business", businessId);
  revalidatePath("/admin/businesses");
  return { success: true };
}

// Правка чужого бизнеса модератором/админом — например, если владелец
// разместил недопустимое фото или текст. RLS (businesses_update_own_or_staff)
// уже разрешает staff обновлять любой бизнес, здесь просто нет фильтра по owner_id.
export async function adminUpdateBusinessAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { supabase, user } = await requireStaff();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Некорректный id бизнеса" };

  const { data: business } = await supabase.from("businesses").select("id, slug").eq("id", id).single();
  if (!business) return { error: "Бизнес не найден" };

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    cityId: formData.get("cityId"),
    description: formData.get("description"),
    addressText: formData.get("addressText"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    instagram: formData.get("instagram"),
    website: formData.get("website"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase
    .from("businesses")
    .update(parsedBusinessPayload(parsed.data, formData))
    .eq("id", id);

  if (error) return { error: "Не получилось сохранить: " + error.message };

  await logAdminAction(supabase, user.id, "edit", "business", id);
  revalidatePath(`/admin/businesses/${id}/edit`);
  revalidatePath("/admin/businesses");
  revalidatePath(`/business/${business.slug}`);
  return { success: "Изменения сохранены" };
}

export async function adminDeleteBusinessAction(businessId: string) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("businesses").delete().eq("id", businessId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "delete", "business", businessId);
  revalidatePath("/admin/businesses");
  return { success: true };
}
