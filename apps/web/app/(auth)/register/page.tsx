"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithMagicLinkAction, type AuthActionState } from "@/lib/actions/auth";
import { GoogleButton } from "../GoogleButton";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    signInWithMagicLinkAction,
    null
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Войти
        </Link>
      </p>

      <div className="mt-6">
        <GoogleButton next="/" />
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        или
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Без пароля — пришлём ссылку для входа на почту, имя можно будет указать в профиле.
          </p>
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {state?.success && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Отправляем..." : "Зарегистрироваться по почте"}
        </button>
      </form>
    </div>
  );
}
