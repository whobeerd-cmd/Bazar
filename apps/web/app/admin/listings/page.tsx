import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ModerationRow, type PendingListing } from "./ModerationRow";
import { AllListingsRow, type AdminListing } from "./AllListingsRow";

const TABS: { status: string; label: string }[] = [
  { status: "pending", label: "На модерации" },
  { status: "active", label: "Опубликованные" },
  { status: "sold", label: "Проданные" },
  { status: "archived", label: "В архиве" },
  { status: "rejected", label: "Отклонённые" },
  { status: "all", label: "Все" },
];

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = TABS.some((t) => t.status === rawStatus) ? rawStatus! : "pending";
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("id, title, slug, price, price_type, created_at, cover_image_url, is_vip, status, profiles(full_name)");

  query = status === "all" ? query : query.eq("status", status);
  query = status === "pending" ? query.order("created_at") : query.order("created_at", { ascending: false });

  const { data: listings } = await query;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Объявления</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Очередь модерации и обзор всех объявлений — снять VIP или отправить в архив можно
        в любой момент, не только при первой проверке.
      </p>

      <nav className="mt-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={tab.status === "pending" ? "/admin/listings" : `/admin/listings?status=${tab.status}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              status === tab.status
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        {!listings || listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Здесь пока пусто.
          </div>
        ) : status === "pending" ? (
          (listings as any[]).map((l) => {
            const seller = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
            const row: PendingListing = {
              id: l.id,
              title: l.title,
              slug: l.slug,
              price: l.price,
              price_type: l.price_type,
              created_at: l.created_at,
              cover_url: l.cover_image_url,
              seller_name: seller?.full_name ?? null,
            };
            return <ModerationRow key={row.id} listing={row} />;
          })
        ) : (
          (listings as any[]).map((l) => {
            const seller = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
            const row: AdminListing = {
              id: l.id,
              slug: l.slug,
              title: l.title,
              status: l.status,
              price: l.price,
              price_type: l.price_type,
              is_vip: l.is_vip,
              cover_url: l.cover_image_url,
              seller_name: seller?.full_name ?? null,
            };
            return <AllListingsRow key={row.id} listing={row} />;
          })
        )}
      </div>
    </div>
  );
}
