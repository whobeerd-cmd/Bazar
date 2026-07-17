import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase-клиент для использования в Client Components ("use client").
 * Использует публичный anon-ключ — безопасен для браузера благодаря RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
