"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminArchiveListingAction, toggleListingVipAction } from "@/lib/actions/admin/listings";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground" },
  pending: { label: "На модерации", className: "bg-amber-100 text-amber-800" },
  active: { label: "Опубликовано", className: "bg-green-100 text-green-700" },
  rejected: { label: "Отклонено", className: "bg-red-100 text-red-700" },
  archived: { label: "В архиве", className: "bg-muted text-muted-foreground" },
  sold: { label: "Продано", className: "bg-muted text-muted-foreground" },
};

export type AdminListing = {
  id: string;
  slug: string;
  title: string;
  status: string;
  price: number | null;
  price_type: string;
  is_vip: boolean;
  cover_url: string | null;
  seller_name: string | null;
};

export function AllListingsRow({ listing }: { listing: AdminListing }) {
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
    <div className="card flex items-center gap-4 p-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {listing.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.cover_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <a href={`/listings/${listing.slug}`} target="_blank" rel="noreferrer" className="truncate font-medium text-foreground hover:underline">
            {listing.title}
          </a>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
          {listing.is_vip && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">VIP</span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {listing.seller_name || "Продавец"} · {formatPrice(listing.price_type, listing.price)}
        </p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={listing.is_vip}
            disabled={isPending}
            onChange={(e) => run(() => toggleListingVipAction(listing.id, e.target.checked))}
          />
          VIP
        </label>
        {listing.status !== "archived" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Отправить объявление в архив?")) return;
              run(() => adminArchiveListingAction(listing.id));
            }}
            className="btn-secondary py-1.5"
          >
            В архив
          </button>
        )}
      </div>
    </div>
  );
}
