import Link from "next/link";
import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { queryBusinesses, getBusinessCategories, type BusinessSort } from "@/lib/business/queries";
import { BusinessFiltersForm } from "@/components/business/BusinessFiltersForm";
import { BusinessCardView } from "@/components/business/BusinessCardView";
import { Pagination } from "@/components/listings/Pagination";

export const metadata: Metadata = {
  title: "Бизнес-справочник",
  description: "Все бизнесы Республики Ингушетия по разделам — с фото, отзывами и рейтингом.",
};

export default async function BusinessDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; sort?: string; page?: string }>;
}) {
  const raw = await searchParams;
  const supabase = await createClient();

  const [categories, { data: cities }] = await Promise.all([
    getBusinessCategories(supabase),
    supabase.from("cities").select("id, name").order("name"),
  ]);

  const isFiltering = Boolean(raw.q || raw.city);

  const { items, count, page, pageSize } = isFiltering
    ? await queryBusinesses(supabase, {
        search: raw.q,
        cityId: raw.city ? Number(raw.city) : undefined,
        sort: (raw.sort as BusinessSort) ?? "rating",
        page: raw.page ? Number(raw.page) : 1,
      })
    : { items: [], count: 0, page: 1, pageSize: 24 };

  const { items: featured } = isFiltering
    ? { items: [] }
    : await queryBusinesses(supabase, { sort: "rating", pageSize: 4 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Бизнес-справочник</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Все заведения и компании Ингушетии в одном месте — с фото, адресом и отзывами реальных людей.
      </p>

      <div className="mt-6">
        <BusinessFiltersForm basePath="/business" cities={cities ?? []} current={{ q: raw.q, city: raw.city, sort: raw.sort }} />
      </div>

      {isFiltering ? (
        <div className="mt-8">
          <p className="mb-4 text-sm font-medium text-muted-foreground">Найдено: {count}</p>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Ничего не найдено — попробуйте изменить запрос или город.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((b) => (
                <BusinessCardView key={b.id} business={b} />
              ))}
            </div>
          )}
          <Pagination basePath="/business" searchParams={{ q: raw.q, city: raw.city, sort: raw.sort }} page={page} pageSize={pageSize} total={count} />
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Рекомендуем</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {featured.map((b) => (
                  <BusinessCardView key={b.id} business={b} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Разделы</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/business/category/${category.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm font-semibold text-foreground">Есть свой бизнес?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Добавьте его в справочник бесплатно — клиенты найдут вас по разделу и городу.
            </p>
            <Link href="/my-business/new" className="btn-primary mt-4 inline-block">
              Добавить бизнес
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
