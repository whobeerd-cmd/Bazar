"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, logAdminAction } from "@/lib/auth/admin";

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

export async function adminDeleteBusinessAction(businessId: string) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("businesses").delete().eq("id", businessId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "delete", "business", businessId);
  revalidatePath("/admin/businesses");
  return { success: true };
}
