"use client";

import { useState } from "react";
import { Star } from "lucide-react";

// Readonly-режим (по умолчанию) — для карточек и заголовка отзыва.
// editable — для формы "Оставить отзыв" (клик/наведение выставляют значение).
export function StarRating({
  value,
  size = 16,
  editable = false,
  onChange,
}: {
  value: number;
  size?: number;
  editable?: boolean;
  onChange?: (value: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value;

  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!editable}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => editable && setHovered(n)}
          className={editable ? "cursor-pointer" : "cursor-default"}
          aria-label={`${n} из 5`}
        >
          <Star
            width={size}
            height={size}
            className={n <= shown ? "text-accent" : "text-border-strong"}
            fill={n <= shown ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
