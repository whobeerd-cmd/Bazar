"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  adminToggleVerifiedAction,
  adminToggleFeaturedAction,
  adminSetBusinessStatusAction,
  adminDeleteBusinessAction,
} from "@/lib/actions/admin/business";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Опубликован", className: "bg-green-100 text-green-700" },
  hidden: { label: "Скрыт", className: "bg-muted text-muted-foreground" },
  archived: { label: "В архиве", className: "bg-muted text-muted-foreground" },
};

export type AdminBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  cover_image_url: string | null;
  owner_name: string | null;
};

export function AdminBusinessRow({ business }: { business: AdminBusiness }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const statusInfo = STATUS_LABELS[business.status] ?? { label: business.status, className: "bg-muted" };

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
        {business.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.cover_image_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/business/${business.slug}`}
            target="_blank"
            rel="noreferrer"
            className="truncate font-medium text-foreground hover:underline"
          >
            {business.name}
          </a>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusInfo.className}`}>{statusInfo.label}</span>
          {business.is_verified && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Проверен</span>
          )}
          {business.is_featured && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Рекомендуем</span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {business.owner_name || "Владелец"} ·{" "}
          {business.rating_count > 0 ? `★ ${business.rating_avg.toFixed(1)} (${business.rating_count})` : "Нет отзывов"}
        </p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={business.is_verified}
            disabled={isPending}
            onChange={(e) => run(() => adminToggleVerifiedAction(business.id, e.target.checked))}
          />
          Проверен
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={business.is_featured}
            disabled={isPending}
            onChange={(e) => run(() => adminToggleFeaturedAction(business.id, e.target.checked))}
          />
          Рекомендуем
        </label>

        {business.status !== "hidden" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => adminSetBusinessStatusAction(business.id, "hidden"))}
            className="btn-secondary py-1.5"
          >
            Скрыть
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => adminSetBusinessStatusAction(business.id, "active"))}
            className="btn-secondary py-1.5"
          >
            Показать
          </button>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm("Удалить бизнес без возможности восстановления?")) return;
            run(() => adminDeleteBusinessAction(business.id));
          }}
          className="btn-secondary py-1.5 text-red-600"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
