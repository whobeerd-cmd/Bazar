"use client";

import { useState, useTransition } from "react";
import { toggleBannerActiveAction, deleteBannerAction } from "@/lib/actions/admin/banners";

type Banner = {
  id: number;
  image_url: string;
  link_url: string | null;
  position: string;
  sort_order: number;
  is_active: boolean;
};

const POSITION_LABELS: Record<string, string> = {
  home_top: "Верх главной",
  home_middle: "Середина главной",
  sidebar: "Боковая колонка",
};

export function BannerRow({ banner }: { banner: Banner }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <tr className="border-b border-border text-sm">
      <td className="p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner.image_url} alt="" className="h-10 w-20 rounded object-cover" />
      </td>
      <td className="p-3 text-muted-foreground">{POSITION_LABELS[banner.position] ?? banner.position}</td>
      <td className="p-3 text-muted-foreground">{banner.sort_order}</td>
      <td className="p-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await toggleBannerActiveAction(banner.id, !banner.is_active);
              if (result?.error) setError(result.error);
            })
          }
          className={`rounded-full px-2 py-0.5 text-xs ${
            banner.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
          }`}
        >
          {banner.is_active ? "активен" : "скрыт"}
        </button>
      </td>
      <td className="p-3 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm("Удалить баннер?")) return;
            startTransition(async () => {
              const result = await deleteBannerAction(banner.id);
              if (result?.error) setError(result.error);
            });
          }}
          className="text-xs text-red-600 underline"
        >
          Удалить
        </button>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </td>
    </tr>
  );
}
