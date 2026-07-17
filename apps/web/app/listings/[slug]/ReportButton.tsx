"use client";

import { useActionState, useState } from "react";
import { reportListingAction } from "@/lib/actions/listings";
import type { AuthActionState } from "@/lib/actions/auth";

const REASONS = [
  { value: "prohibited", label: "Запрещённый товар/услуга" },
  { value: "scam", label: "Похоже на мошенничество" },
  { value: "duplicate", label: "Дублирует другое объявление" },
  { value: "wrong_category", label: "Неверная категория" },
  { value: "other", label: "Другое" },
];

export function ReportButton({ listingId, isAuthenticated }: { listingId: string; isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    reportListingAction,
    null
  );

  if (!isAuthenticated) {
    return (
      <a href="/login" className="text-sm text-muted-foreground underline">
        Войдите, чтобы пожаловаться
      </a>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-muted-foreground underline">
        Пожаловаться
      </button>
    );
  }

  if (state?.success) {
    return <p className="text-sm text-green-700">{state.success}</p>;
  }

  return (
    <form action={formAction} className="max-w-sm space-y-3 rounded-md border border-border p-4">
      <input type="hidden" name="listingId" value={listingId} />
      <p className="text-sm font-medium">Пожаловаться на объявление</p>

      <select
        name="reason"
        required
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <textarea
        name="comment"
        placeholder="Комментарий (необязательно)"
        rows={3}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "Отправляем..." : "Отправить"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">
          Отмена
        </button>
      </div>
    </form>
  );
}
