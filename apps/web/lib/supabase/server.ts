import { cache } from "react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Глобальный (per-Node-процесс) реестр незавершённых supabase.auth.getUser()
 * вызовов, ключ — сырое значение auth-cookie. Нужен, потому что React.cache()
 * ненадёжен для этого случая: Server Action и последующий ре-рендер страницы
 * в Next.js могут исполняться в разных инстансах модуля (бандл экшна и бандл
 * страницы собираются отдельно), поэтому cache() не всегда возвращает один и
 * тот же клиент в рамках одного запроса — эмпирически подтверждено (два вызова
 * createClient() с идентичными cookies получали разные объекты). Если каждый
 * из них независимо вызовет getUser() и токен уже истёк, оба попытаются
 * обновить один и тот же refresh-токен — Supabase разрешает использовать его
 * только один раз, второй вызов падает с "Invalid Refresh Token: Already Used"
 * и разлогинивает пользователя прямо на сабмите формы. globalThis переживает
 * дублирование модуля (это одна и та же память процесса), поэтому здесь лок
 * работает надёжно независимо от того, сколько раз был вызван createClient().
 */
declare global {
  // eslint-disable-next-line no-var
  var __bazarGetUserLocks: Map<string, Promise<unknown>> | undefined;
}
const getUserLocks = (globalThis.__bazarGetUserLocks ??= new Map<string, Promise<unknown>>());

/**
 * Supabase-клиент для использования в Server Components, Server Actions
 * и Route Handlers. Работает с cookies текущего запроса — так пользователь
 * остаётся авторизован при SSR. auth.getUser() задедублен через globalThis
 * (см. комментарий выше) — на один и тот же refresh-токен уходит не больше
 * одного реального запроса к Supabase, даже если createClient() вызвали
 * несколько раз за один HTTP-запрос.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  const client = createServerClient(
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

  const authTokenCookie = cookieStore.getAll().find((c) => c.name.endsWith("-auth-token"));
  if (authTokenCookie) {
    const lockKey = authTokenCookie.value;
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = (async () => {
      let pending = getUserLocks.get(lockKey);
      if (!pending) {
        pending = originalGetUser().finally(() => {
          if (getUserLocks.get(lockKey) === pending) getUserLocks.delete(lockKey);
        });
        getUserLocks.set(lockKey, pending);
      }
      return pending;
    }) as typeof client.auth.getUser;
  }

  return client;
});

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
