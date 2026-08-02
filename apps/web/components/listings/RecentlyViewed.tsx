"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import type { ListingCard } from "@/lib/listings/query";
import { ListingCardView } from "./ListingCardView";

// Читаем localStorage только после монтирования — на сервере этих данных
// нет, так что рендерим пусто первым кадром, чтобы не ловить hydration
// mismatch.
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<ListingCard[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed().filter((i) => i.id !== excludeId));
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <div className="mt-14 border-t border-border pt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Недавно просмотренные
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {items.slice(0, 6).map((item) => (
          <ListingCardView key={item.id} listing={item} />
        ))}
      </div>
    </div>
  );
}
