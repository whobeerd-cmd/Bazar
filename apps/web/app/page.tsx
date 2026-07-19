import Link from "next/link";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getCategoryTree } from "@/lib/categories";

const VALUE_PROPS = ["Бесплатно для частных лиц", "Без посредников", "Публикация сразу, без ожидания"];

function subcategoryLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} подраздел`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} подраздела`;
  return `${count} подразделов`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const [categories, { data: banners }] = await Promise.all([
    getCategoryTree(),
    supabase
      .from("banners")
      .select("id, image_url, link_url")
      .eq("position", "home_top")
      .order("sort_order"),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 70% at 12% 0%, hsl(var(--primary) / 0.12), transparent 60%), radial-gradient(45% 55% at 100% 5%, hsl(var(--accent) / 0.14), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            Республика Ингушетия
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Объявления без лишнего шума
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Недвижимость, авто, работа и услуги — рядом с вами. Никакой сторонней
            рекламы, только то, что вы ищете.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/my-ads/new"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-card-hover"
            >
              Разместить объявление
            </Link>
            <Link
              href="/search"
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-muted"
            >
              Смотреть объявления
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {VALUE_PROPS.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                {item}
              </span>
            ))}
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

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Категории</h2>
          <p className="mt-1 text-sm text-muted-foreground">Выберите раздел или наведите на карточку, чтобы увидеть подразделы</p>
        </div>

        {categories && categories.length > 0 ? (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <li key={category.id} className="group relative">
                <Link
                  href={`/category/${category.slug}`}
                  className="relative z-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-5 text-center shadow-card transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-card-hover"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-sm transition duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                    <CategoryIcon slug={category.slug} className="h-7 w-7" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{category.name}</span>
                  {category.children.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {subcategoryLabel(category.children.length)}
                    </span>
                  )}
                </Link>

                {category.children.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-20 w-64 -translate-x-1/2 translate-y-1 pt-2 opacity-0 transition duration-150 md:group-hover:visible md:group-hover:translate-y-0 md:group-hover:opacity-100">
                    <div className="rounded-2xl border border-border bg-background p-3 shadow-card-hover">
                      <ul>
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/category/${child.slug}`}
                              className="block truncate rounded-lg px-3 py-1.5 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
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
