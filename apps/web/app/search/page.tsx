import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { queryListings } from "@/lib/listings/query";
import { parseListingFilters, flattenSearchParams, type RawSearchParams } from "@/lib/listings/parseFilters";
import { FiltersForm } from "@/components/listings/FiltersForm";
import { ListingCardView } from "@/components/listings/ListingCardView";
import { Pagination } from "@/components/listings/Pagination";

// Динамические результаты поиска не индексируем — избегаем "тонкого"
// дублирующегося контента в выдаче, категории индексируются отдельно.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawSearchParams = await searchParams;
  const supabase = await createClient();

  const { data: cities } = await supabase.from("cities").select("id, name").order("name");

  const filters = parseListingFilters(rawSearchParams);
  const { items, count, page, pageSize } = await queryListings(supabase, filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        {filters.search ? `Результаты поиска: «${filters.search}»` : "Поиск объявлений"}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside>
          <FiltersForm
            basePath="/search"
            cities={cities ?? []}
            current={flattenSearchParams(rawSearchParams)}
            searchPlaceholder="Что ищете?"
          />
        </aside>

        <div>
          <p className="mb-4 text-sm font-medium text-muted-foreground">Найдено: {count}</p>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {filters.search ? "Ничего не найдено — попробуйте изменить запрос или фильтры." : "Введите запрос слева."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((listing) => (
                <ListingCardView key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          <Pagination
            basePath="/search"
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
