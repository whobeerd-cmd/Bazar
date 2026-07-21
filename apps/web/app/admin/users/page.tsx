import { requireAdmin } from "@/lib/auth/admin";
import { UserRow, type AdminUser } from "./UserRow";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase, user: currentUser } = await requireAdmin();

  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, is_blocked, created_at, last_seen_at, user_roles(roles(code))")
    .eq("is_demo", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) query = query.ilike("full_name", `%${q}%`);

  const [{ data: profiles }, { count: totalCount }] = await Promise.all([
    query,
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_demo", false),
  ]);

  const users: AdminUser[] = (profiles ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    phone: p.phone,
    avatar_url: p.avatar_url,
    is_blocked: p.is_blocked,
    created_at: p.created_at,
    last_seen_at: p.last_seen_at,
    roleCodes: (p.user_roles ?? [])
      .map((ur: any) => (Array.isArray(ur.roles) ? ur.roles[0]?.code : ur.roles?.code))
      .filter(Boolean),
  }));

  const ONLINE_WINDOW_MS = 5 * 60 * 1000;
  const onlineCount = users.filter(
    (u) => u.last_seen_at && Date.now() - new Date(u.last_seen_at).getTime() < ONLINE_WINDOW_MS
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Пользователи</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Назначайте роли модератора/администратора и блокируйте нарушителей — без SQL.
        Роль superadmin выдаётся только напрямую в базе.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-muted px-3 py-1.5 font-medium text-foreground">
          Всего зарегистрировано: {totalCount ?? 0}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Сейчас онлайн: {onlineCount}
        </span>
      </div>

      <form action="/admin/users" method="get" className="mt-4 max-w-sm">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Поиск по имени..."
          className="field-input mt-0"
        />
      </form>

      <div className="mt-6 space-y-3">
        {users.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Никого не найдено.
          </div>
        ) : (
          users.map((u) => <UserRow key={u.id} user={u} isSelf={u.id === currentUser.id} />)
        )}
      </div>
    </div>
  );
}
