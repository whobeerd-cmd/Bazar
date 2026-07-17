import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingRow, type MyListing } from "./ListingRow";

const SECTIONS: { status: string; title: string }[] = [
  { status: "active", title: "Опубликованные" },
  { status: "pending", title: "На модерации" },
  { status: "draft", title: "Черновики" },
  { status: "rejected", title: "Отклонённые" },
  { status: "sold", title: "Проданные" },
  { status: "archived", title: "В архиве" },
];

export default async function MyAdsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-ads");

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, slug, status, price, price_type, created_at, cover_image_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const enriched: MyListing[] = (listings ?? []).map((l) => ({
    ...l,
    cover_url: l.cover_image_url,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Мои объявления</h1>
        <Link href="/my-ads/new" className="btn-primary">
          + Разместить объявление
        </Link>
      </div>

      {enriched.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          У вас пока нет объявлений.
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {SECTIONS.map((section) => {
            const items = enriched.filter((l) => l.status === section.status);
            if (items.length === 0) return null;
            return (
              <div key={section.status}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title} ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((listing) => (
                    <ListingRow key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
