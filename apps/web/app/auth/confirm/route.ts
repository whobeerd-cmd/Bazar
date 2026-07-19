import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Обработчик обязательно должен быть Route Handler'ом (не страницей) — только
// так можно записать cookie с сессией в ответ. Supabase присылает сюда либо
// ?code=... (PKCE — регистрация/вход/восстановление по умолчанию для этого
// проекта), либо ?token_hash=...&type=... (если письмо когда-нибудь
// настроят иначе). Если ни то ни другое не подошло — редирект на резервную
// страницу, которая пытается забрать сессию из #фрагмента адреса на клиенте.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  const destination = type === "recovery" ? "/update-password" : "/";

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/confirm/fallback`);
}
