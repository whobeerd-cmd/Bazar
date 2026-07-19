import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ConfirmFallback } from "./ConfirmFallback";

// В проекте включён PKCE-флоу — письмо со ссылкой на подтверждение ведёт не
// прямо на сайт, а на собственный /auth/v1/verify Supabase (это его
// стандартная ссылка {{ .ConfirmationURL }}). Supabase сам проверяет токен и
// уже потом редиректит сюда с кодом ?code=... — его нужно обменять на сессию
// через exchangeCodeForSession, точно так же, как это уже делает вход через
// Google в /auth/callback. token_hash/type и #фрагмент — запасные варианты
// на случай, если письмо когда-нибудь настроят иначе.
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>;
}) {
  const { code, token_hash: tokenHash, type } = await searchParams;
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(type === "recovery" ? "/update-password" : "/");
    }
  }

  if (tokenHash && type) {
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
