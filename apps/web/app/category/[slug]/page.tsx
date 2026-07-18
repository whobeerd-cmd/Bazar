import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { queryListings } from "@/lib/listings/query";
import { parseListingFilters, flattenSearchParams, type RawSearchParams } from "@/lib/listings/parseFilters";
import { FiltersForm } from "@/components/listings/FiltersForm";
import { ListingCardView } from "@/components/listings/ListingCardView";
import { Pagination } from "@/components/listings/Pagination";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) return {};

  const title = category.name;
  const description = `${category.name} в Ингушетии — объявления от частных лиц, без посредников.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { slug } = await params;
  const rawSearchParams = await searchParams;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, is_active")
    .eq("slug", slug)
    .single();

  if (!category || !category.is_active) notFound();

  const [{ data: parent }, { data: children }, { data: cities }] = await Promise.all([
    category.parent_id
      ? supabase.from("categories").select("name, slug").eq("id", category.parent_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("parent_id", category.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("cities").select("id, name").order("name"),
  ]);

  const categoryIds = [category.id, ...((children ?? []).map((c) => c.id))];
  const filters = parseListingFilters(rawSearchParams);
  const { items, count, page, pageSize } = await queryListings(supabase, { ...filters, categoryIds });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-medium text-muted-foreground">
        {parent && (
          <>
            <Link href={`/category/${parent.slug}`} className="hover:text-foreground hover:underline">
              {parent.name}
            </Link>
            {" / "}
          </>
        )}
        {category.name}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">{category.name}</h1>

      {children && children.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium transition hover:border-border-strong hover:bg-muted"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside>
          <FiltersForm
            basePath={`/category/${slug}`}
            cities={cities ?? []}
            current={flattenSearchParams(rawSearchParams)}
            searchPlaceholder="Искать в этой категории"
          />
        </aside>

        <div>
          <p className="mb-4 text-sm font-medium text-muted-foreground">Найдено: {count}</p>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              По этим фильтрам ничего не найдено — попробуйте изменить условия слева.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((listing) => (
                <ListingCardView key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          <Pagination
            basePath={`/category/${slug}`}
            searchParams={flattenSearchParams(rawSearchParams)}
            page={page}
            pageSize={pageSize}
            total={count}
          />
        </div>
      </div>
    </div>
  );
}
