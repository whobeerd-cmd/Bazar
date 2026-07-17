import { createClient } from "@/lib/supabase/server";
import { ComplaintRow, type ComplaintItem } from "./ComplaintRow";

export default async function AdminComplaintsPage() {
  const supabase = await createClient();

  const { data: complaints } = await supabase
    .from("complaints")
    .select(
      "id, reason, comment, status, created_at, listings(title, slug), profiles(full_name)"
    )
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  const rows: ComplaintItem[] = (complaints ?? []).map((c) => {
    const listing = Array.isArray(c.listings) ? c.listings[0] : c.listings;
    const reporter = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    return {
      id: c.id,
      reason: c.reason,
      comment: c.comment,
      status: c.status,
      created_at: c.created_at,
      listing_title: listing?.title ?? null,
      listing_slug: listing?.slug ?? null,
      reporter_name: reporter?.full_name ?? null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Жалобы</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Жалобы пользователей на объявления. Новые — сверху.
      </p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Жалоб пока нет.</p>
        ) : (
          rows.map((complaint) => <ComplaintRow key={complaint.id} complaint={complaint} />)
        )}
      </div>
    </div>
  );
}
