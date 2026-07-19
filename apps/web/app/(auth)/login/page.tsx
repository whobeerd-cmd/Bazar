"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction, signInWithMagicLinkAction, type AuthActionState } from "@/lib/actions/auth";
import { GoogleButton } from "../GoogleButton";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<"magic" | "password">("password");
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    AuthActionState,
    FormData
  >(signInAction, null);
  const [magicState, magicFormAction, isMagicPending] = useActionState<AuthActionState, FormData>(
    signInWithMagicLinkAction,
    null
  );
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/profile";

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ещё нет аккаунта?{" "}
        <Link href="/register" className="underline underline-offset-4">
          Зарегистрироваться
        </Link>
      </p>

      <div className="mt-6">
        <GoogleButton next={next} />
      </div>

      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        или
        <div className="h-px flex-1 bg-border" />
      </div>

      {mode === "password" ? (
        <>
          <form action={passwordFormAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />

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

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-muted-foreground underline underline-offset-4"
                >
                  Забыли пароль?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
              />
            </div>

            {passwordState?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {passwordState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPasswordPending}
              className="w-full rounded-full bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
            >
              {isPasswordPending ? "Входим..." : "Войти"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode("magic")}
            className="mt-4 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Войти без пароля — по ссылке на почту
          </button>
        </>
      ) : (
        <>
          <form action={magicFormAction} className="space-y-4">
            <div>
              <label htmlFor="magic-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="magic-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Подойдёт и для нового аккаунта — если такой почты ещё нет, мы её зарегистрируем.
              </p>
            </div>

            {magicState?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {magicState.error}
              </p>
            )}
            {magicState?.success && (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {magicState.success}
              </p>
            )}

            <button
              type="submit"
              disabled={isMagicPending}
              className="w-full rounded-full bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
            >
              {isMagicPending ? "Отправляем..." : "Отправить ссылку для входа"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode("password")}
            className="mt-4 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Войти по паролю
          </button>
        </>
      )}
    </div>
  );
}
