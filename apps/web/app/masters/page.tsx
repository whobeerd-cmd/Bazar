import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { queryBusinesses, getBusinessCategories, type BusinessSort } from "@/lib/business/queries";
import { BusinessFiltersForm } from "@/components/business/BusinessFiltersForm";
import { BusinessCardView } from "@/components/business/BusinessCardView";
import { BusinessCategoryIcon } from "@/components/business/BusinessCategoryIcon";
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

  const [categories, { data: cities }] = await Promise.all([
    getBusinessCategories(supabase, "master"),
    supabase.from("cities").select("id, name").order("name"),
  ]);

  const isFiltering = Boolean(raw.q || raw.city);

  const { items, count, page, pageSize } = isFiltering
    ? await queryBusinesses(supabase, {
        type: "master",
        search: raw.q,
        cityId: raw.city ? Number(raw.city) : undefined,
        sort: (raw.sort as BusinessSort) ?? "rating",
        page: raw.page ? Number(raw.page) : 1,
      })
    : { items: [], count: 0, page: 1, pageSize: 24 };

  const { items: featured } = isFiltering
    ? { items: [] }
    : await queryBusinesses(supabase, { type: "master", sort: "rating", pageSize: 4 });

  const categoryGroups = new Map<string, typeof categories>();
  for (const category of categories) {
    const label = category.group_label ?? "Другое";
    if (!categoryGroups.has(label)) categoryGroups.set(label, []);
    categoryGroups.get(label)!.push(category);
  }

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
        <BusinessFiltersForm
          basePath="/masters"
          cities={cities ?? []}
          current={{ q: raw.q, city: raw.city, sort: raw.sort }}
          searchPlaceholder="Имя мастера или вид услуги..."
        />
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
              {items.map((m) => (
                <BusinessCardView key={m.id} business={m} basePath="/masters" />
              ))}
            </div>
          )}
          <Pagination basePath="/masters" searchParams={{ q: raw.q, city: raw.city, sort: raw.sort }} page={page} pageSize={pageSize} total={count} />
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Рекомендуем</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {featured.map((m) => (
                  <BusinessCardView key={m.id} business={m} basePath="/masters" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 space-y-8">
            {Array.from(categoryGroups.entries()).map(([label, group]) => (
              <div key={label}>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{label}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {group.map((category) => (
                    <Link
                      key={category.id}
                      href={`/masters/category/${category.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <BusinessCategoryIcon slug={category.slug} className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-foreground">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
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
        </>
      )}
    </div>
  );
}
