"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAdminAction } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function resolveDataRequestAction(requestId: string) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("data_requests")
    .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user.id })
    .eq("id", requestId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "resolve", "data_request", requestId);
  revalidatePath("/admin/data-requests");
  return { success: true };
}

// Удаляет аккаунт пользователя целиком (auth + профиль + всё, что на него
// ссылается с on delete cascade) и закрывает заявку — используется, когда
// человек попросил стереть свои данные.
export async function deleteUserAccountAction(requestId: string, userId: string) {
  const { supabase, user } = await requireAdmin();

  const serviceClient = createServiceRoleClient();
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);
  if (deleteError) return { error: "Не получилось удалить аккаунт: " + deleteError.message };

  const { error } = await supabase
    .from("data_requests")
    .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user.id })
    .eq("id", requestId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "delete_account", "data_request", requestId);
  revalidatePath("/admin/data-requests");
  return { success: true };
}
