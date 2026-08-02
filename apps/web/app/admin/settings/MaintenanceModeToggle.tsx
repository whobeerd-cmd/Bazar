"use client";

import { useState, useTransition } from "react";
import { toggleMaintenanceModeAction } from "@/lib/actions/admin/settings";

export function MaintenanceModeToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    const next = !enabled;
    if (
      next &&
      !confirm("Закрыть сайт для всех, кроме админов? Обычные посетители увидят страницу «на техобслуживании».")
    )
      return;

    setError(null);
    const previous = enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await toggleMaintenanceModeAction(next);
      if (result?.error) {
        setError(result.error);
        setEnabled(previous);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={isPending}
          onClick={handleToggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
            enabled ? "bg-red-600" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
              enabled ? "left-6" : "left-1"
            }`}
          />
        </button>
        <span className={`text-sm font-semibold ${enabled ? "text-red-600" : "text-foreground"}`}>
          {enabled ? "Сайт закрыт для всех, кроме админов" : "Сайт открыт"}
        </span>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
