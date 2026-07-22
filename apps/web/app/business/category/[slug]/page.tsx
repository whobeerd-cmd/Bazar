import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { queryBusinesses, type BusinessSort } from "@/lib/business/queries";
import { BusinessFiltersForm } from "@/components/business/BusinessFiltersForm";
import { BusinessCardView } from "@/components/business/BusinessCardView";
import { Pagination } from "@/components/listings/Pagination";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase.from("business_categories").select("name").eq("slug", slug).single();
  if (!category) return {};

  const title = category.name;
  const description = `${category.name} в Ингушетии — адреса, фото, отзывы и рейтинг.`;
  return { title, description, openGraph: { title, description } };
}

export default async function BusinessCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; city?: string; sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const raw = await searchParams;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("business_categories")
    .select("id, name, slug, is_active")
    .eq("slug", slug)
    .single();

  if (!category || !category.is_active) notFound();

  const { data: cities } = await supabase.from("cities").select("id, name").order("name");

  const { items, count, page, pageSize } = await queryBusinesses(supabase, {
    categoryId: category.id,
    search: raw.q,
    cityId: raw.city ? Number(raw.city) : undefined,
    sort: (raw.sort as BusinessSort) ?? "rating",
    page: raw.page ? Number(raw.page) : 1,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-medium text-muted-foreground">Бизнес-справочник</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">{category.name}</h1>

      <div className="mt-6">
        <BusinessFiltersForm
          basePath={`/business/category/${slug}`}
          cities={cities ?? []}
          current={{ q: raw.q, city: raw.city, sort: raw.sort }}
        />
      </div>

      <div className="mt-8">
        <p className="mb-4 text-sm font-medium text-muted-foreground">Найдено: {count}</p>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            В этом разделе пока нет бизнесов — станьте первым.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((b) => (
              <BusinessCardView key={b.id} business={b} />
            ))}
          </div>
        )}
        <Pagination
          basePath={`/business/category/${slug}`}
          searchParams={{ q: raw.q, city: raw.city, sort: raw.sort }}
          page={page}
          pageSize={pageSize}
          total={count}
        />
      </div>
    </div>
  );
}
