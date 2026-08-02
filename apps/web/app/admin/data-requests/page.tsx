import { requireAdmin } from "@/lib/auth/admin";
import { DataRequestRow, type DataRequest } from "./DataRequestRow";

export default async function AdminDataRequestsPage() {
  const { supabase } = await requireAdmin();

  const { data: requests } = await supabase
    .from("data_requests")
    .select("id, user_id, status, created_at, profiles(full_name, phone)")
    .order("created_at", { ascending: false });

  const rows: DataRequest[] = (requests ?? []).map((r: any) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      userId: r.user_id,
      status: r.status,
      createdAt: r.created_at,
      userName: profile?.full_name ?? null,
      userPhone: profile?.phone ?? null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Запросы на удаление данных</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Заявки пользователей на удаление аккаунта и персональных данных (152-ФЗ).
      </p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Заявок пока нет.
          </div>
        ) : (
          rows.map((row) => <DataRequestRow key={row.id} request={row} />)
        )}
      </div>
    </div>
  );
}
