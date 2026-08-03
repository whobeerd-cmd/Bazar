import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Короткий кэш флага "сайт отключён" в памяти процесса — без него пришлось
// бы дёргать Supabase на КАЖДОЙ странице сайта всегда, а не только во время
// самого техобслуживания (см. комментарий про лимит запросов на бесплатном
// плане ниже). Несколько секунд задержки при включении/выключении — ок.
declare global {
  // eslint-disable-next-line no-var
  var __bazarMaintenanceCache: { value: boolean; expiresAt: number } | undefined;
}

// Пути, доступные только авторизованным пользователям.
const PROTECTED_PREFIXES = ["/profile", "/my-ads", "/my-business", "/masters/new", "/drafts", "/favorites", "/messages", "/notifications", "/balance", "/admin"];

// Эти пути остаются доступны даже в режиме "сайт отключён" (техобслуживание) —
// иначе владелец не сможет зайти и снова включить сайт.
const MAINTENANCE_BYPASS_PREFIXES = ["/login", "/auth", "/admin"];

const MAINTENANCE_HTML = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Сайт временно недоступен</title>
<style>body{font-family:system-ui,-apple-system,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#faf8f3;color:#201e19;text-align:center;padding:24px}
div{max-width:420px}h1{font-size:1.35rem;margin:0 0 .5rem}p{color:#6e6858;font-size:.95rem;margin:0}</style></head>
<body><div><h1>Сайт временно на техническом обслуживании</h1><p>Скоро вернёмся — попробуйте зайти чуть позже.</p></div></body></html>`;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const checksMaintenance = !MAINTENANCE_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Server Actions (POST с заголовком Next-Action) выполняются в том же
  // Node-процессе, что и страница, и там уже есть свой закэшированный
  // Supabase-клиент (lib/supabase/server.ts, через React.cache), который
  // сам проверяет auth.getUser() внутри экшна. Middleware же выполняется
  // в отдельном Edge-рантайме — если он тоже полезет обновлять токен на
  // этом же запросе, будет гонка за один refresh-токен, и один из двух
  // клиентов упадёт с "Invalid Refresh Token: Already Used", разлогинив
  // пользователя прямо на сабмите формы. Экшны сами возвращают ошибку
  // "Нужно войти в аккаунт", если пользователь не авторизован, поэтому
  // здесь для них безопасно просто пропустить запрос без повторной
  // проверки/обновления сессии.
  if (request.headers.get("next-action")) {
    return NextResponse.next();
  }

  // На публичных страницах, которые ещё и не проверяются на "сайт отключён"
  // (сейчас таких нет — проверка идёт почти везде), вообще не обращаемся
  // к Supabase — экономит запросы на бесплатном плане.
  if (!isProtected && !checksMaintenance) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let userFetched = false;
  let cachedUser: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  async function getCachedUser() {
    if (!userFetched) {
      const { data } = await supabase.auth.getUser();
      cachedUser = data.user;
      userFetched = true;
    }
    return cachedUser;
  }

  if (checksMaintenance) {
    const cached = globalThis.__bazarMaintenanceCache;
    const now = Date.now();
    let maintenanceEnabled: boolean;

    if (cached && cached.expiresAt > now) {
      maintenanceEnabled = cached.value;
    } else {
      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      maintenanceEnabled = Boolean((setting?.value as { enabled?: boolean } | null)?.enabled);
      globalThis.__bazarMaintenanceCache = { value: maintenanceEnabled, expiresAt: now + 15000 };
    }

    if (maintenanceEnabled) {
      const user = await getCachedUser();
      let isAdmin = false;
      if (user) {
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("roles(code)")
          .eq("user_id", user.id);
        isAdmin = (userRoles ?? []).some((row: any) => ["admin", "superadmin"].includes(row.roles?.code));
      }
      if (!isAdmin) {
        return new NextResponse(MAINTENANCE_HTML, {
          status: 503,
          headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600" },
        });
      }
    }
  }

  if (!isProtected) {
    return response;
  }

  // ВАЖНО: getUser() (а не getSession()) — она реально проверяет токен на сервере Supabase,
  // а не просто читает то, что лежит в cookie.
  const user = await getCachedUser();

  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Новые пользователи (name_required = true, см. миграцию 0021) обязаны
  // указать имя в профиле, прежде чем пользоваться личным кабинетом.
  // /profile сама исключена из проверки, иначе редирект зациклится.
  if (!request.nextUrl.pathname.startsWith("/profile")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, name_required")
      .eq("id", user.id)
      .single();

    if (profile?.name_required && !profile.full_name?.trim()) {
      return NextResponse.redirect(new URL("/profile?required=1", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
