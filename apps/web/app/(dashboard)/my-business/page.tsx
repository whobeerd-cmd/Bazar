import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessRow, type MyBusiness } from "./BusinessRow";

export default async function MyBusinessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-business");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, type, name, slug, status, rating_avg, rating_count, cover_image_url")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const items: MyBusiness[] = (businesses ?? []).map((b) => ({ ...b, rating_avg: Number(b.rating_avg) }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Мои бизнесы и анкеты</h1>
        <div className="flex gap-2">
          <Link href="/masters/new" className="btn-secondary">
            + Анкета мастера
          </Link>
          <Link href="/my-business/new" className="btn-primary">
            + Добавить бизнес
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          У вас пока нет бизнесов или анкет мастера в справочнике.
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((business) => (
            <BusinessRow key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
