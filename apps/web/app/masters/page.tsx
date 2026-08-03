import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { queryBusinesses, type BusinessSort } from "@/lib/business/queries";
import { BusinessFiltersForm } from "@/components/business/BusinessFiltersForm";
import { BusinessCardView } from "@/components/business/BusinessCardView";
import { Pagination } from "@/components/listings/Pagination";

export const metadata: Metadata = {
  title: "Мастера",
  description: "Частные мастера и специалисты Республики Ингушетия — ремонт, красота, репетиторство и другое.",
};

export default async function MastersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; sort?: string; page?: string }>;
}) {
  const raw = await searchParams;
  const supabase = await createClient();

  const { data: cities } = await supabase.from("cities").select("id, name").order("name");

  const { items, count, page, pageSize } = await queryBusinesses(supabase, {
    type: "master",
    search: raw.q,
    cityId: raw.city ? Number(raw.city) : undefined,
    sort: (raw.sort as BusinessSort) ?? "rating",
    page: raw.page ? Number(raw.page) : 1,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Мастера</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Частные специалисты Ингушетии — ремонт, красота, репетиторство и другие услуги напрямую, без посредников.{" "}
        <Link href="/business" className="font-medium text-primary hover:underline">
          Ищете компанию? Загляните в бизнес-справочник →
        </Link>
      </p>

      <div className="mt-6">
        <BusinessFiltersForm basePath="/masters" cities={cities ?? []} current={{ q: raw.q, city: raw.city, sort: raw.sort }} />
      </div>

      <div className="mt-8">
        <p className="mb-4 text-sm font-medium text-muted-foreground">Найдено: {count}</p>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Ничего не найдено — попробуйте изменить запрос или город.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <BusinessCardView key={m.id} business={m} basePath="/masters" />
            ))}
          </div>
        )}
        <Pagination basePath="/masters" searchParams={{ q: raw.q, city: raw.city, sort: raw.sort }} page={page} pageSize={pageSize} total={count} />
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm font-semibold text-foreground">Вы мастер своего дела?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Разместите анкету бесплатно — клиенты найдут вас напрямую, без посредников.
        </p>
        <Link href="/masters/new" className="btn-primary mt-4 inline-block">
          Разместить анкету
        </Link>
      </div>
    </div>
  );
}
