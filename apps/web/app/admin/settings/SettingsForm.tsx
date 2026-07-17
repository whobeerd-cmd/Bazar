"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction } from "@/lib/actions/admin/settings";
import type { AuthActionState } from "@/lib/actions/auth";

export function SettingsForm({
  defaults,
}: {
  defaults: {
    siteName: string;
    siteDescription: string;
    contactPhone: string;
    contactEmail: string;
  };
}) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    updateSiteSettingsAction,
    null
  );

  return (
    <form action={formAction} className="mt-6 max-w-lg space-y-4">
      <div>
        <label className="text-sm font-medium">Название сайта</label>
        <input
          name="siteName"
          defaultValue={defaults.siteName}
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Описание (для SEO)</label>
        <textarea
          name="siteDescription"
          defaultValue={defaults.siteDescription}
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Контактный телефон</label>
          <input
            name="contactPhone"
            defaultValue={defaults.contactPhone}
            placeholder="+79991234567"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Контактный email</label>
          <input
            name="contactEmail"
            type="email"
            defaultValue={defaults.contactEmail}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
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
