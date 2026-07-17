"use client";

import { useState, useTransition } from "react";
import { resolveComplaintAction } from "@/lib/actions/admin/complaints";

const REASON_LABELS: Record<string, string> = {
  prohibited: "Запрещённый товар/услуга",
  scam: "Похоже на мошенничество",
  duplicate: "Дублирует другое объявление",
  wrong_category: "Неверная категория",
  other: "Другое",
};

export type ComplaintItem = {
  id: number;
  reason: string;
  comment: string | null;
  status: string;
  created_at: string;
  listing_title: string | null;
  listing_slug: string | null;
  reporter_name: string | null;
};

export function ComplaintRow({ complaint }: { complaint: ComplaintItem }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function resolve(status: "reviewed" | "dismissed") {
    setError(null);
    startTransition(async () => {
      const result = await resolveComplaintAction(complaint.id, status);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{REASON_LABELS[complaint.reason] ?? complaint.reason}</p>
          {complaint.listing_slug ? (
            <a
              href={`/listings/${complaint.listing_slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {complaint.listing_title}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">Объявление удалено</span>
          )}
          {complaint.comment && <p className="mt-1 text-sm text-muted-foreground">{complaint.comment}</p>}
          <p className="mt-1 text-xs text-muted-foreground">От: {complaint.reporter_name || "пользователь"}</p>
        </div>

        {complaint.status === "new" ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("reviewed")}
              className="btn-primary py-1.5"
            >
              Рассмотрено
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => resolve("dismissed")}
              className="btn-secondary py-1.5"
            >
              Отклонить жалобу
            </button>
          </div>
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {complaint.status === "reviewed" ? "рассмотрено" : "отклонено"}
          </span>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
