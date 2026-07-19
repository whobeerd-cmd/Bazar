"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
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
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${
        favorited ? "border-red-200 bg-red-50 text-red-600" : "border-border text-foreground hover:bg-muted"
      }`}
    >
      <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} />
      {favorited ? "В избранном" : "В избранное"}
    </button>
  );
}
