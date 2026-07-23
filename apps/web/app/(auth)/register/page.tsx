"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpAction, signInWithMagicLinkAction, type AuthActionState } from "@/lib/actions/auth";
import { GoogleButton } from "../GoogleButton";
import { Turnstile } from "@/components/Turnstile";

export default function RegisterPage() {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    AuthActionState,
    FormData
  >(signUpAction, null);
  const [magicState, magicFormAction, isMagicPending] = useActionState<AuthActionState, FormData>(
    signInWithMagicLinkAction,
    null
  );

  const [passwordCaptcha, setPasswordCaptcha] = useState("");
  const [magicCaptcha, setMagicCaptcha] = useState("");

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

      {mode === "password" ? (
        <>
          <form action={passwordFormAction} className="space-y-4">
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
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="field-input"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">Не короче 8 символов.</p>
            </div>

            <input type="hidden" name="captchaToken" value={passwordCaptcha} />
            <Turnstile key={passwordState?.error ?? "initial"} onToken={setPasswordCaptcha} />

            {passwordState?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {passwordState.error}
              </p>
            )}
            {passwordState?.success && (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {passwordState.success}
              </p>
            )}

            <button type="submit" disabled={isPasswordPending} className="btn-primary w-full py-2.5">
              {isPasswordPending ? "Регистрируем..." : "Зарегистрироваться"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode("magic")}
            className="mt-4 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Зарегистрироваться без пароля — по ссылке на почту
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
                className="field-input"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Без пароля — пришлём ссылку для входа на почту. Если письмо не сработает с первого
                раза (бывает у некоторых почтовых сервисов), надёжнее зарегистрироваться по паролю.
              </p>
            </div>

            <input type="hidden" name="captchaToken" value={magicCaptcha} />
            <Turnstile key={magicState?.error ?? "initial"} onToken={setMagicCaptcha} />

            {magicState?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{magicState.error}</p>
            )}
            {magicState?.success && (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {magicState.success}
              </p>
            )}

            <button type="submit" disabled={isMagicPending} className="btn-primary w-full py-2.5">
              {isMagicPending ? "Отправляем..." : "Отправить ссылку для входа"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode("password")}
            className="mt-4 w-full text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Зарегистрироваться по паролю
          </button>
        </>
      )}
    </div>
  );
}
