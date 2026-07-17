"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton({ next = "/profile" }: { next?: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // После этого браузер сам уходит на страницу входа Google — код сюда не возвращается.
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-3 py-2.5 text-sm font-semibold transition hover:border-border-strong hover:bg-muted disabled:opacity-60"
    >
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.4-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.8 36 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5z"/>
      </svg>
      {isPending ? "Переходим в Google..." : "Войти через Google"}
    </button>
  );
}
