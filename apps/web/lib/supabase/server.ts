import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase-клиент для использования в Server Components, Server Actions
 * и Route Handlers. Работает с cookies текущего запроса — так пользователь
 * остаётся авторизован при SSR.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll вызывается из Server Component без возможности записи cookie —
            // безопасно игнорируется, если рядом есть middleware, обновляющий сессию.
          }
        },
      },
    }
  );
}

/**
 * Клиент с сервисным ключом — только для доверенного серверного кода
 * (Route Handlers вебхуков, скрипты миграций). НИКОГДА не импортировать
 * в код, доступный клиенту, и не логировать SUPABASE_SERVICE_ROLE_KEY.
 */
export function createServiceRoleClient() {
  const { createClient: createRawClient } = require("@supabase/supabase-js");
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
