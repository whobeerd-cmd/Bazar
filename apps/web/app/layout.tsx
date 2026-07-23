import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategoryTree } from "@/lib/categories";
import { CategoryMegaMenu } from "@/components/CategoryMegaMenu";
import "./globals.css";

const golosText = Golos_Text({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-golos",
  display: "swap",
});

// Значения по умолчанию, если site_settings ещё не заполнен —
// сам сайт никогда не должен падать из-за отсутствия настройки.
const DEFAULT_SITE_NAME = "Bazar";
const DEFAULT_SITE_DESCRIPTION =
  "Площадка объявлений Республики Ингушетия: недвижимость, авто, работа, услуги и многое другое.";

async function getSiteSettings() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["site_name", "site_description", "logo_url"]);

    const settings = Object.fromEntries(
      (data ?? []).map((row) => [row.key, row.value])
    ) as Record<string, { text?: string; url?: string } | undefined>;

    return {
      siteName: settings.site_name?.text ?? DEFAULT_SITE_NAME,
      siteDescription: settings.site_description?.text ?? DEFAULT_SITE_DESCRIPTION,
      logoUrl: settings.logo_url?.url ?? null,
    };
  } catch {
    // На старте проекта таблицы/данных может ещё не быть — не роняем приложение
    return {
      siteName: DEFAULT_SITE_NAME,
      siteDescription: DEFAULT_SITE_DESCRIPTION,
      logoUrl: null,
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteDescription } = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s — ${siteName}`,
    },
    description: siteDescription,
    openGraph: {
      title: siteName,
      description: siteDescription,
      locale: "ru_RU",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteName, logoUrl } = await getSiteSettings();
  const categoryTree = await getCategoryTree();

  let userLabel: string | null = null;
  let isAdmin = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userLabel = user?.email ?? null;

    if (user) {
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("roles(code)")
        .eq("user_id", user.id);
      const codes = (userRoles ?? []).map((row: any) => row.roles?.code);
      isAdmin = codes.some((code: string) => code === "admin" || code === "superadmin");

      // Отметка "в сети" для админки — best-effort, не блокирует рендер страницы.
      supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", user.id)
        .then(() => {});
    }
  } catch {
    userLabel = null;
  }

  return (
    <html lang="ru" className={golosText.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div aria-hidden className="h-[3px] bg-gradient-to-r from-primary via-primary to-accent" />
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-[1.35rem] font-extrabold tracking-tight text-foreground">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-7 w-7 rounded-md object-contain" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
                  {siteName.charAt(0)}
                </span>
              )}
              {siteName}
            </Link>

            <div className="shrink-0">
              <CategoryMegaMenu tree={categoryTree} />
            </div>

            <form action="/search" method="get" className="hidden max-w-md flex-1 sm:block">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="9" cy="9" r="6.5" />
                  <path d="M17.5 17.5 13.9 13.9" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  name="q"
                  placeholder="Поиск объявлений..."
                  className="w-full rounded-full border border-border bg-muted/60 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-border-strong focus:bg-background focus:ring-2 focus:ring-primary/25"
                />
              </div>
            </form>

            <nav className="ml-auto flex items-center gap-1 text-sm sm:gap-2">
              {isAdmin && (
                <Link href="/admin/dashboard" className="hidden rounded-full px-3 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:inline-block">
                  Админка
                </Link>
              )}
              {userLabel && (
                <Link
                  href="/my-ads/new"
                  className="rounded-full bg-primary px-3.5 py-1.5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover"
                >
                  <span className="sm:hidden">+</span>
                  <span className="hidden sm:inline">+ Подать объявление</span>
                </Link>
              )}
              {userLabel ? (
                <>
                  <Link
                    href="/profile"
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-foreground transition hover:bg-muted sm:hidden"
                    aria-label="Профиль"
                  >
                    <CircleUserRound className="h-5 w-5" strokeWidth={1.8} />
                  </Link>
                  <Link href="/profile" className="ml-1 hidden rounded-full px-3 py-1.5 font-medium text-foreground transition hover:bg-muted sm:inline-block">
                    Мой профиль
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-full px-3 py-1.5 text-foreground transition hover:bg-muted">
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="hidden rounded-full bg-primary px-3.5 py-1.5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover sm:inline-block"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </nav>
          </div>

          <form action="/search" method="get" className="border-t border-border px-4 py-2.5 sm:hidden">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="9" cy="9" r="6.5" />
                <path d="M17.5 17.5 13.9 13.9" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Поиск объявлений..."
                className="w-full rounded-full border border-border bg-muted/60 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-border-strong focus:bg-background focus:ring-2 focus:ring-primary/25"
              />
            </div>
          </form>
        </header>

        <main>{children}</main>

        <footer className="mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-foreground">{siteName}</p>
              <p>Площадка объявлений Республики Ингушетия</p>
              <Link href="/rules" className="hover:text-foreground hover:underline">
                Правила размещения
              </Link>
              <p>© {new Date().getFullYear()} {siteName}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
