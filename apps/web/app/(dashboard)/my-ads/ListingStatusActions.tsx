"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  archiveListingAction,
  deleteListingAction,
  markSoldAction,
  submitListingAction,
} from "@/lib/actions/listings";

export function ListingStatusActions({ listingId, status }: { listingId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(action: () => Promise<{ error?: string; success?: unknown } | undefined>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(status === "draft" || status === "rejected") && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => submitListingAction(listingId))}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            Отправить на модерацию
          </button>
        )}

        {status === "draft" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Удалить черновик без возможности восстановления?")) return;
              run(() => deleteListingAction(listingId));
            }}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-red-600 disabled:opacity-60"
          >
            Удалить черновик
          </button>
        )}

        {status === "active" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => markSoldAction(listingId))}
              className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-60"
            >
              Отметить как продано
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => archiveListingAction(listingId))}
              className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-60"
            >
              В архив
            </button>
          </>
        )}

        {status === "pending" && (
          <p className="text-sm text-muted-foreground">Объявление на модерации, ожидайте проверки.</p>
        )}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
