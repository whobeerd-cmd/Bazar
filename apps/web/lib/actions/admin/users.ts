"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAdminAction } from "@/lib/auth/admin";

// Управлять можно только "admin" и "moderator" — "superadmin" сознательно
// не выдаётся из интерфейса, только напрямую через SQL (это владелец сайта).
const MANAGEABLE_ROLES = ["admin", "moderator"] as const;
export type ManageableRole = (typeof MANAGEABLE_ROLES)[number];

export async function toggleUserRoleAction(
  targetUserId: string,
  roleCode: ManageableRole,
  shouldHave: boolean
) {
  const { supabase, user } = await requireAdmin();

  if (!MANAGEABLE_ROLES.includes(roleCode)) {
    return { error: "Эту роль нельзя менять из интерфейса" };
  }
  if (targetUserId === user.id) {
    return { error: "Нельзя менять свою собственную роль — попросите другого администратора" };
  }

  const { data: role } = await supabase.from("roles").select("id").eq("code", roleCode).single();
  if (!role) return { error: "Роль не найдена" };

  if (shouldHave) {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: targetUserId, role_id: role.id });
    if (error && error.code !== "23505") return { error: error.message };
  } else {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId)
      .eq("role_id", role.id);
    if (error) return { error: error.message };
  }

  await logAdminAction(
    supabase,
    user.id,
    shouldHave ? "grant_role" : "revoke_role",
    "user",
    targetUserId,
    { role: roleCode }
  );
  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserBlockedAction(targetUserId: string, isBlocked: boolean) {
  const { supabase, user } = await requireAdmin();

  if (targetUserId === user.id) {
    return { error: "Нельзя заблокировать самого себя" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_blocked: isBlocked })
    .eq("id", targetUserId);
  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, isBlocked ? "block_user" : "unblock_user", "user", targetUserId);
  revalidatePath("/admin/users");
  return { success: true };
}
