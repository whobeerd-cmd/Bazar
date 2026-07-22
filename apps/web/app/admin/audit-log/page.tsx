import { requireAdmin } from "@/lib/auth/admin";

const ACTION_LABELS: Record<string, string> = {
  create: "создал(а)",
  update: "изменил(а)",
  delete: "удалил(а)",
  activate: "включил(а)",
  deactivate: "выключил(а)",
  approve: "одобрил(а)",
  reject: "отклонил(а)",
  archive: "отправил(а) в архив",
  mark_vip: "отметил(а) VIP",
  unmark_vip: "снял(а) VIP",
  reviewed: "рассмотрел(а) жалобу",
  dismissed: "отклонил(а) жалобу",
  grant_role: "выдал(а) роль",
  revoke_role: "снял(а) роль",
  block_user: "заблокировал(а)",
  unblock_user: "разблокировал(а)",
  verify_business: "отметил(а) проверенным",
  unverify_business: "снял(а) отметку проверенного",
  feature_business: "отметил(а) рекомендуемым",
  unfeature_business: "снял(а) отметку рекомендуемого",
  set_status_active: "опубликовал(а)",
  set_status_hidden: "скрыл(а)",
  set_status_archived: "отправил(а) в архив",
};

const ENTITY_LABELS: Record<string, string> = {
  category: "категорию",
  banner: "баннер",
  listing: "объявление",
  complaint: "жалобу",
  user: "пользователя",
  business: "бизнес",
};

export default async function AdminAuditLogPage() {
  const { supabase } = await requireAdmin();

  const { data: entries } = await supabase
    .from("admin_audit_log")
    .select("id, action, entity, entity_id, diff, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Журнал действий</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Последние 100 действий администраторов и модераторов — кто и что менял. Запись
        необратима, редактировать или удалять записи нельзя.
      </p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Когда</th>
              <th className="p-3 font-medium">Кто</th>
              <th className="p-3 font-medium">Что сделал</th>
              <th className="p-3 font-medium">ID записи</th>
            </tr>
          </thead>
          <tbody>
            {(entries ?? []).map((entry: any) => {
              const admin = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
              return (
                <tr key={entry.id} className="border-b border-border last:border-0">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString("ru-RU")}
                  </td>
                  <td className="p-3 text-foreground">{admin?.full_name || "—"}</td>
                  <td className="p-3 text-foreground">
                    {ACTION_LABELS[entry.action] ?? entry.action} {ENTITY_LABELS[entry.entity] ?? entry.entity}
                  </td>
                  <td className="p-3 text-muted-foreground">{entry.entity_id ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!entries || entries.length === 0) && (
          <p className="p-4 text-sm text-muted-foreground">Пока пусто.</p>
        )}
      </div>
    </div>
  );
}
