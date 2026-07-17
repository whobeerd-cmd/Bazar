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
    <form action={formAction} className="space-y-4">
      <div>
        <label className="field-label">Название сайта</label>
        <input name="siteName" defaultValue={defaults.siteName} required className="field-input" />
      </div>

      <div>
        <label className="field-label">Описание (для SEO)</label>
        <textarea
          name="siteDescription"
          defaultValue={defaults.siteDescription}
          rows={2}
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Контактный телефон</label>
          <input
            name="contactPhone"
            defaultValue={defaults.contactPhone}
            placeholder="+79991234567"
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Контактный email</label>
          <input name="contactEmail" type="email" defaultValue={defaults.contactEmail} className="field-input" />
        </div>
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
