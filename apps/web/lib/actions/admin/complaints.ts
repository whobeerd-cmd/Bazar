"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, logAdminAction } from "@/lib/auth/admin";

export async function resolveComplaintAction(
  complaintId: number,
  status: "reviewed" | "dismissed"
) {
  const { supabase, user } = await requireStaff();

  const { error } = await supabase
    .from("complaints")
    .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, status, "complaint", complaintId);
  revalidatePath("/admin/complaints");
  return { success: true };
}
