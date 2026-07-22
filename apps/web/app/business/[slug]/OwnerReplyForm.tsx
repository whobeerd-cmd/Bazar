"use client";

import { useActionState, useState } from "react";
import { replyToReviewAction } from "@/lib/actions/business";
import type { AuthActionState } from "@/lib/actions/auth";

export function OwnerReplyForm({ reviewId, businessId, slug }: { reviewId: number; businessId: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(replyToReviewAction, null);

  if (state?.success) return null;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-primary hover:underline">
        Ответить
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 space-y-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="slug" value={slug} />
      <textarea name="reply" rows={2} maxLength={1000} placeholder="Ваш ответ..." className="field-input" />
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary py-1.5 text-xs">
          {isPending ? "Отправляем..." : "Отправить"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost py-1.5 text-xs">
          Отмена
        </button>
      </div>
    </form>
  );
}
