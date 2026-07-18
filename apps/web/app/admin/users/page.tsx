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
    .select("id, full_name, phone, avatar_url, is_blocked, created_at, user_roles(roles(code))")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: profiles } = await query;

  const users: AdminUser[] = (profiles ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    phone: p.phone,
    avatar_url: p.avatar_url,
    is_blocked: p.is_blocked,
    created_at: p.created_at,
    roleCodes: (p.user_roles ?? [])
      .map((ur: any) => (Array.isArray(ur.roles) ? ur.roles[0]?.code : ur.roles?.code))
      .filter(Boolean),
  }));

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Пользователи</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Назначайте роли модератора/администратора и блокируйте нарушителей — без SQL.
        Роль superadmin выдаётся только напрямую в базе.
      </p>

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
