"use client";

import { useActionState, useState } from "react";
import { submitReviewAction } from "@/lib/actions/business";
import type { AuthActionState } from "@/lib/actions/auth";
import { StarRating } from "@/components/business/StarRating";

export function ReviewForm({
  businessId,
  slug,
  initialRating,
  initialBody,
}: {
  businessId: string;
  slug: string;
  initialRating?: number;
  initialBody?: string;
}) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(submitReviewAction, null);
  const [rating, setRating] = useState(initialRating ?? 5);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="field-label mb-1.5">Оценка</p>
        <StarRating value={rating} editable size={22} onChange={setRating} />
      </div>

      <textarea
        name="body"
        rows={3}
        maxLength={1000}
        defaultValue={initialBody}
        placeholder="Расскажите о своём опыте (необязательно)..."
        className="field-input"
      />

      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-700">{state.success}</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Отправляем..." : initialBody ? "Обновить отзыв" : "Оставить отзыв"}
      </button>
    </form>
  );
}
