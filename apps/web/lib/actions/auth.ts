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
// Регистрация
// ----------------------------------------------------------------------------
export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const emailResult = emailSchema.safeParse(formData.get("email"));
  const passwordResult = passwordSchema.safeParse(formData.get("password"));

  if (!emailResult.success) {
    return { error: emailResult.error.issues[0]?.message };
  }
  if (!passwordResult.success) {
    return { error: passwordResult.error.issues[0]?.message };
  }
  if (!fullName) {
    return { error: "Укажите имя" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: emailResult.data,
    password: passwordResult.data,
    options: {
      data: { full_name: fullName },
      // Supabase отправит письмо со ссылкой вида /auth/confirm?token_hash=...&type=email
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return {
    success:
      "Мы отправили письмо со ссылкой подтверждения на вашу почту. Перейдите по ней, чтобы завершить регистрацию.",
  };
}

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

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm?type=recovery`,
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
  return known[message] ?? message;
}
