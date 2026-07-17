"use client";

import { useTransition } from "react";
import { deleteCommentAction } from "@/lib/actions/comments";

export function DeleteCommentButton({ commentId, slug }: { commentId: number; slug: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Удалить комментарий?")) return;
        startTransition(async () => {
          await deleteCommentAction(commentId, slug);
        });
      }}
      className="text-xs text-muted-foreground hover:text-red-600 disabled:opacity-60"
    >
      Удалить
    </button>
  );
}
