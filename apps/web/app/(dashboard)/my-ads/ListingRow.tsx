"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { archiveListingAction, boostListingAction, deleteListingAction, markSoldAction } from "@/lib/actions/listings";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
  pending: { label: "На модерации", className: "bg-amber-100 text-amber-800" },
  active: { label: "Опубликовано", className: "bg-green-100 text-green-700" },
  rejected: { label: "Отклонено", className: "bg-red-100 text-red-700" },
  archived: { label: "В архиве", className: "bg-muted text-muted-foreground" },
  sold: { label: "Продано", className: "bg-muted text-muted-foreground" },
};

export type MyListing = {
  id: string;
  title: string;
  slug: string;
  status: string;
  price: number | null;
  price_type: string;
  created_at: string;
  cover_url: string | null;
};

export function ListingRow({ listing }: { listing: MyListing }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const statusInfo = STATUS_LABELS[listing.status] ?? { label: listing.status, className: "bg-muted" };

  function run(action: () => Promise<{ error?: string } | undefined>) {
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
    <div className="flex items-center gap-4 rounded-lg border border-border p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {listing.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.cover_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {listing.status === "active" ? (
            <Link href={`/listings/${listing.slug}`} className="truncate font-medium hover:underline">
              {listing.title}
            </Link>
          ) : (
            <span className="truncate font-medium">{listing.title}</span>
          )}
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatPrice(listing.price_type, listing.price)}
        </p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm">
        <Link href={`/my-ads/${listing.id}/edit`} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">
          Редактировать
        </Link>

        {listing.status === "active" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => boostListingAction(listing.id))}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-60"
            >
              Поднять в списке
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => markSoldAction(listing.id))}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-60"
            >
              Продано
            </button>
          </>
        )}

        {(listing.status === "active" || listing.status === "sold") && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => archiveListingAction(listing.id))}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-60"
          >
            В архив
          </button>
        )}

        {listing.status === "draft" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Удалить черновик без возможности восстановления?")) return;
              run(() => deleteListingAction(listing.id));
            }}
            className="rounded-md border border-border px-3 py-1.5 text-red-600 disabled:opacity-60"
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}
