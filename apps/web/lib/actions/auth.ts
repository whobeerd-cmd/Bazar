"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
} | null;

const emailSchema = z.string().email("Введите корректный email");
const passwordSchema = z
  .string()
  .min(8, "Пароль должен быть не короче 8 символов");

// ----------------------------------------------------------------------------
// Вход
// ----------------------------------------------------------------------------
export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/profile");

  if (!email || !password) {
    return { error: "Введите email и пароль" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect(next || "/profile");
}

// ----------------------------------------------------------------------------
// Регистрация по почте и паролю — основной способ. Не зависит от перехода по
// ссылке в письме: если у проекта отключено обязательное подтверждение
// почты, сессия появляется сразу; если включено — Supabase присылает письмо
// для подтверждения (ту же ссылку обрабатывает /auth/confirm).
// ----------------------------------------------------------------------------
export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const emailResult = emailSchema.safeParse(formData.get("email"));
  if (!emailResult.success) {
    return { error: emailResult.error.issues[0]?.message };
  }
  const passwordResult = passwordSchema.safeParse(formData.get("password"));
  if (!passwordResult.success) {
    return { error: passwordResult.error.issues[0]?.message };
  }

  const captchaToken = String(formData.get("captchaToken") ?? "") || undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: emailResult.data,
    password: passwordResult.data,
    options: { captchaToken },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    success:
      "Мы отправили письмо для подтверждения на вашу почту — перейдите по ссылке из него, чтобы завершить регистрацию.",
  };
}

// ----------------------------------------------------------------------------
// Вход по ссылке на почту, без пароля — работает и для новых пользователей
// (создаёт аккаунт при первом входе), и для уже зарегистрированных.
// ----------------------------------------------------------------------------
export async function signInWithMagicLinkAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const emailResult = emailSchema.safeParse(formData.get("email"));
  if (!emailResult.success) {
    return { error: emailResult.error.issues[0]?.message };
  }

  const captchaToken = String(formData.get("captchaToken") ?? "") || undefined;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: emailResult.data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
      captchaToken,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return {
    success: "Мы отправили ссылку для входа на вашу почту — перейдите по ней с этого устройства.",
  };
}

// ----------------------------------------------------------------------------
// Выход
// ----------------------------------------------------------------------------
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ----------------------------------------------------------------------------
// Запрос на восстановление пароля
// ----------------------------------------------------------------------------
export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const emailResult = emailSchema.safeParse(formData.get("email"));
  if (!emailResult.success) {
    return { error: emailResult.error.issues[0]?.message };
  }

  const captchaToken = String(formData.get("captchaToken") ?? "") || undefined;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm?type=recovery`,
    captchaToken,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return {
    success: "Если такой email зарегистрирован, мы отправили на него ссылку для смены пароля.",
  };
}

// ----------------------------------------------------------------------------
// Установка нового пароля (после перехода по ссылке восстановления)
// ----------------------------------------------------------------------------
export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const passwordResult = passwordSchema.safeParse(formData.get("password"));
  if (!passwordResult.success) {
    return { error: passwordResult.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: passwordResult.data });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect("/profile");
}

// ----------------------------------------------------------------------------
// Перевод типовых ошибок Supabase на понятный русский
// ----------------------------------------------------------------------------
function translateAuthError(message: string): string {
  const known: Record<string, string> = {
    "Invalid login credentials": "Неверный email или пароль",
    "User already registered": "Пользователь с таким email уже зарегистрирован",
    "Email not confirmed": "Email ещё не подтверждён — проверьте почту",
    "Password should be at least 6 characters": "Пароль слишком короткий",
  };
  if (known[message]) return known[message];
  // На необычные/непонятные ответы Supabase (пустые тела ошибок и т.п.) не
  // показываем пользователю сырой текст вроде "{}" — только понятное сообщение.
  if (!message || !/[a-zA-Zа-яА-Я]/.test(message) || message.length > 200) {
    return "Не получилось выполнить запрос — попробуйте ещё раз через минуту";
  }
  return message;
}
