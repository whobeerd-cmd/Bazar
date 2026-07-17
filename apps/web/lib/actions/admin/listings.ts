"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff, logAdminAction } from "@/lib/auth/admin";
import type { AuthActionState } from "@/lib/actions/auth";

export async function approveListingAction(listingId: string, markVip = false) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase
    .from("listings")
    .update({ status: "active", rejection_reason: null, is_vip: markVip })
    .eq("id", listingId);

  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "approve", "listing", listingId, { is_vip: markVip });
  revalidatePath("/admin/listings");
  return { success: true };
}

// Метка VIP уже опубликованного объявления — например, если решили выделить
// его позже, не только в момент одобрения.
export async function toggleListingVipAction(listingId: string, isVip: boolean) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("listings").update({ is_vip: isVip }).eq("id", listingId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, isVip ? "mark_vip" : "unmark_vip", "listing", listingId);
  revalidatePath("/admin/listings");
  return { success: true };
}

// Архивировать любое объявление (не только своё) — например, если жалоба
// подтвердилась постфактум, уже после публикации.
export async function adminArchiveListingAction(listingId: string) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase.from("listings").update({ status: "archived" }).eq("id", listingId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "archive", "listing", listingId);
  revalidatePath("/admin/listings");
  return { success: true };
}

const rejectSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().trim().min(3, "Укажите причину отклонения"),
});

export async function rejectListingAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { supabase, user } = await requireStaff();

  const parsed = rejectSchema.safeParse({
    listingId: formData.get("listingId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase
    .from("listings")
    .update({ status: "rejected", rejection_reason: parsed.data.reason })
    .eq("id", parsed.data.listingId);

  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "reject", "listing", parsed.data.listingId, {
    reason: parsed.data.reason,
  });
  revalidatePath("/admin/listings");
  return { success: "Объявление отклонено" };
}
