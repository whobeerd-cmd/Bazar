"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";
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
      <a
        href="/login"
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Flag className="h-4 w-4" />
        Пожаловаться
      </a>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Flag className="h-4 w-4" />
        Пожаловаться
      </button>
    );
  }

  if (state?.success) {
    return <p className="text-sm text-green-700">{state.success}</p>;
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
      <input type="hidden" name="listingId" value={listingId} />
      <p className="text-sm font-semibold text-foreground">Пожаловаться на объявление</p>

      <select name="reason" required className="field-input">
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <textarea name="comment" placeholder="Комментарий (необязательно)" rows={3} className="field-input" />

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Отправляем..." : "Отправить"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Отмена
        </button>
      </div>
    </form>
  );
}
