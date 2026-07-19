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
        className="field-input"
      />
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Отправляем..." : "Отправить"}
      </button>
    </form>
  );
}
