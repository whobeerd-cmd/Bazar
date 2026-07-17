"use client";

import { useActionState } from "react";
import { updatePasswordAction, type AuthActionState } from "@/lib/actions/auth";

export default function UpdatePasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    updatePasswordAction,
    null
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Новый пароль</h1>
      <p className="mt-1 text-sm text-muted-foreground">Придумайте новый пароль для входа.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium">
            Новый пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
          />
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
        >
          {isPending ? "Сохраняем..." : "Сохранить пароль"}
        </button>
      </form>
    </div>
  );
}
