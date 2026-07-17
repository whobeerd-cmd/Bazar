import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CategoryIcon } from "@/components/CategoryIcon";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: banners }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .is("parent_id", null)
      .eq("is_active", true)
      .order("sort_order")
      .limit(12),
    supabase
      .from("banners")
      .select("id, image_url, link_url")
      .eq("position", "home_top")
      .order("sort_order"),
  ]);

  return (
    <div>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Объявления Ингушетии — без лишнего шума
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Недвижимость, авто, работа и услуги — рядом с вами. Никакой сторонней
            рекламы, только то, что вы ищете.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/my-ads/new"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
            >
              Разместить объявление
            </Link>
            <Link
              href="/map"
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Смотреть на карте
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {banners && banners.length > 0 && (
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            {banners.map((banner) => {
              const image = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.image_url}
                  alt=""
                  className="w-full rounded-xl border border-border object-cover shadow-card"
                />
              );
              return banner.link_url ? (
                <a key={banner.id} href={banner.link_url}>
                  {image}
                </a>
              ) : (
                <div key={banner.id}>{image}</div>
              );
            })}
          </div>
        )}

        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Категории</h2>
        </div>

        {categories && categories.length > 0 ? (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-background p-5 text-center shadow-card transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/8 text-primary transition group-hover:bg-primary/14">
                    <CategoryIcon slug={category.slug} className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            Категории пока не загружены — выполните supabase/seed.sql.
          </p>
        )}
      </div>
    </div>
  );
}
