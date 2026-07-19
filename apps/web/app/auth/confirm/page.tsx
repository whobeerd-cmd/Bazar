import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ConfirmFallback } from "./ConfirmFallback";

// Supabase присылает в письме ссылку вида:
//   /auth/confirm?token_hash=...&type=email      (подтверждение регистрации)
//   /auth/confirm?token_hash=...&type=recovery   (восстановление пароля)
// Это работает, только если шаблон письма в Supabase настроен на
// {{ .TokenHash }}. Если шаблон не менялся (значение по умолчанию —
// {{ .ConfirmationURL }}), Supabase сначала сам проверяет токен на своём
// сервере и присылает сюда сессию не в query, а в #фрагменте адреса —
// сервер его не видит, поэтому ConfirmFallback забирает её на клиенте.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(type === "recovery" ? "/update-password" : "/");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-7 shadow-card">
        <ConfirmFallback />
      </div>
    </div>
  );
}
