"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import type { AuthActionState } from "@/lib/actions/auth";

export function ProfileForm({
  defaultFullName,
  defaultPhone,
}: {
  defaultFullName: string;
  defaultPhone: string;
}) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    updateProfileAction,
    null
  );

  return (
    <form action={formAction} className="mt-6 max-w-md space-y-4">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium">
          Имя
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={defaultFullName}
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-medium">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+79991234567"
          defaultValue={defaultPhone}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Подтверждение по SMS добавим отдельным модулем позже.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Сохраняем..." : "Сохранить"}
      </button>
    </form>
  );
}
