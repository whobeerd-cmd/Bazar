"use client";

import { useState, useTransition } from "react";
import { toggleFavoriteAction } from "@/lib/actions/favorites";

export function FavoriteButton({
  listingId,
  initialFavorited,
}: {
  listingId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const next = !favorited;
        setFavorited(next);
        startTransition(async () => {
          const result = await toggleFavoriteAction(listingId, next);
          if (result?.error) setFavorited(!next);
        });
      }}
      className={`rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-60 ${
        favorited ? "bg-red-50 text-red-600" : "hover:bg-muted"
      }`}
    >
      {favorited ? "♥ В избранном" : "♡ В избранное"}
    </button>
  );
}
