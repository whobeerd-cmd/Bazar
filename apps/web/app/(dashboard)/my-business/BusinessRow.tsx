"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteBusinessAction, toggleBusinessVisibilityAction } from "@/lib/actions/business";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: "Опубликован", className: "bg-green-100 text-green-700" },
  hidden: { label: "Скрыт", className: "bg-muted text-muted-foreground" },
  archived: { label: "В архиве", className: "bg-muted text-muted-foreground" },
};

export type MyBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  rating_avg: number;
  rating_count: number;
  cover_image_url: string | null;
};

export function BusinessRow({ business }: { business: MyBusiness }) {
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
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {business.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.cover_image_url} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {business.status === "active" ? (
            <Link href={`/business/${business.slug}`} className="truncate font-medium text-foreground hover:underline">
              {business.name}
            </Link>
          ) : (
            <span className="truncate font-medium text-foreground">{business.name}</span>
          )}
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {business.rating_count > 0 ? `★ ${business.rating_avg.toFixed(1)} (${business.rating_count})` : "Пока нет отзывов"}
        </p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm">
        <Link href={`/my-business/${business.id}/edit`} className="btn-secondary py-1.5">
          Редактировать
        </Link>

        {business.status === "active" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => toggleBusinessVisibilityAction(business.id, "hidden"))}
            className="btn-secondary py-1.5"
          >
            Скрыть
          </button>
        )}
        {business.status === "hidden" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => toggleBusinessVisibilityAction(business.id, "active"))}
            className="btn-secondary py-1.5"
          >
            Показать
          </button>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm("Удалить бизнес вместе с фото и отзывами без возможности восстановления?")) return;
            run(() => deleteBusinessAction(business.id));
          }}
          className="btn-secondary py-1.5 text-red-600"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
