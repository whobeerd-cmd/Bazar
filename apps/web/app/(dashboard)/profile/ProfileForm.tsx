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
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="field-label">
          Имя
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={defaultFullName}
          required
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="phone" className="field-label">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+79991234567"
          defaultValue={defaultPhone}
          className="field-input"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Подтверждение по SMS добавим отдельным модулем позже.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
      )}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохраняем..." : "Сохранить"}
      </button>
    </form>
  );
}
