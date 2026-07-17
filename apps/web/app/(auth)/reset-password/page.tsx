"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type AuthActionState } from "@/lib/actions/auth";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    requestPasswordResetAction,
    null
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Восстановление пароля</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Укажите email — пришлём ссылку для смены пароля.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
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
          {isPending ? "Отправляем..." : "Отправить ссылку"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline underline-offset-4">
          Вернуться ко входу
        </Link>
      </p>
    </div>
  );
}
