"use client";

import { useActionState } from "react";
import { addCommentAction } from "@/lib/actions/comments";
import type { AuthActionState } from "@/lib/actions/auth";

export function CommentForm({ listingId, slug }: { listingId: string; slug: string }) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(addCommentAction, null);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="slug" value={slug} />
      <textarea
        name="body"
        required
        rows={2}
        maxLength={1000}
        placeholder="Написать комментарий..."
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Отправляем..." : "Отправить"}
      </button>
    </form>
  );
}
