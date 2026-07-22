import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminBusinessRow, type AdminBusiness } from "./AdminBusinessRow";

const TABS: { status: string; label: string }[] = [
  { status: "active", label: "Опубликованные" },
  { status: "hidden", label: "Скрытые" },
  { status: "archived", label: "В архиве" },
  { status: "all", label: "Все" },
];

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = TABS.some((t) => t.status === rawStatus) ? rawStatus! : "active";
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("businesses")
    .select(
      "id, name, slug, status, is_verified, is_featured, rating_avg, rating_count, cover_image_url, profiles!businesses_owner_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);

  const { data: businesses } = await query;

  const rows: AdminBusiness[] = (businesses ?? []).map((b: any) => {
    const owner = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      status: b.status,
      is_verified: b.is_verified,
      is_featured: b.is_featured,
      rating_avg: Number(b.rating_avg),
      rating_count: b.rating_count,
      cover_image_url: b.cover_image_url,
      owner_name: owner?.full_name ?? null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Бизнесы</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Справочник компаний — отметить проверенным/рекомендуемым, скрыть или удалить.
      </p>

      <nav className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={tab.status === "active" ? "/admin/businesses" : `/admin/businesses?status=${tab.status}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              status === tab.status ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Здесь пока пусто.
          </div>
        ) : (
          rows.map((business) => <AdminBusinessRow key={business.id} business={business} />)
        )}
      </div>
    </div>
  );
}
