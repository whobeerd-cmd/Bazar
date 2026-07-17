"use client";

import { useActionState, useState, useTransition } from "react";
import { approveListingAction, rejectListingAction } from "@/lib/actions/admin/listings";
import type { AuthActionState } from "@/lib/actions/auth";

export type PendingListing = {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  price_type: string;
  created_at: string;
  cover_url: string | null;
  seller_name: string | null;
};

export function ModerationRow({ listing }: { listing: PendingListing }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [vip, setVip] = useState(false);
  const [state, formAction, isRejectPending] = useActionState<AuthActionState, FormData>(
    rejectListingAction,
    null
  );

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {listing.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.cover_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={`/listings/${listing.slug}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium hover:underline"
          >
            {listing.title}
          </a>
          <p className="text-sm text-muted-foreground">
            {listing.seller_name || "Продавец"} ·{" "}
            {listing.price_type === "fixed" ? `${listing.price ?? 0} ₽` : listing.price_type}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} />
            Отметить VIP
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await approveListingAction(listing.id, vip);
                  if (result?.error) setError(result.error);
                });
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Одобрить
            </button>
            <button
              type="button"
              onClick={() => setRejecting((v) => !v)}
              className="rounded-md border border-border px-3 py-1.5 text-sm"
            >
              Отклонить
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {rejecting && !state?.success && (
        <form action={formAction} className="mt-3 flex gap-2">
          <input type="hidden" name="listingId" value={listing.id} />
          <input
            type="text"
            name="reason"
            required
            placeholder="Причина отклонения"
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={isRejectPending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {isRejectPending ? "..." : "Отклонить"}
          </button>
        </form>
      )}
      {state?.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
    </div>
  );
}
