import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase присылает в письме ссылку вида:
//   /auth/confirm?token_hash=...&type=email      (подтверждение регистрации)
//   /auth/confirm?token_hash=...&type=recovery   (восстановление пароля)
// Эта страница "обменивает" токен из письма на настоящую сессию пользователя.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      const destination = type === "recovery" ? "/update-password" : "/";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Ссылка недействительна или уже была использована")}`
  );
}
