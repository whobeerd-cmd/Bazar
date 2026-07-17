import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ADMIN_ROLES = ["admin", "superadmin"];
const STAFF_ROLES = ["admin", "superadmin", "moderator"];

async function requireRoles(allowedRoles: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(code)")
    .eq("user_id", user.id);

  const codes = (userRoles ?? []).map((row: any) => row.roles?.code).filter(Boolean);
  const hasAccess = codes.some((code: string) => allowedRoles.includes(code));

  if (!hasAccess) {
    redirect("/?error=" + encodeURIComponent("Нет доступа к админ-панели"));
  }

  return { supabase, user };
}

/**
 * Проверяет права администратора для текущего запроса.
 * Не авторизован → на /login. Авторизован, но без прав → на / с сообщением.
 * Возвращает { supabase, user }, чтобы страницы могли сразу делать запросы.
 */
export async function requireAdmin() {
  return requireRoles(ADMIN_ROLES);
}

/**
 * То же самое, но также пускает модераторов — для очереди модерации
 * объявлений и жалоб, куда админ доступ не обязателен.
 */
export async function requireStaff() {
  return requireRoles(STAFF_ROLES);
}

/**
 * Записывает действие администратора в неизменяемый журнал audit_log.
 * Вызывать после успешного изменения — до, чтобы не логировать неудачные попытки.
 */
export async function logAdminAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminId: string,
  action: string,
  entity: string,
  entityId: string | number | null,
  diff?: Record<string, unknown>
) {
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    entity,
    entity_id: entityId !== null ? String(entityId) : null,
    diff: diff ?? null,
  });
}
