"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resolveDataRequestAction, deleteUserAccountAction } from "@/lib/actions/admin/dataRequests";

export type DataRequest = {
  id: string;
  userId: string;
  status: "pending" | "resolved";
  createdAt: string;
  userName: string | null;
  userPhone: string | null;
};

export function DataRequestRow({ request }: { request: DataRequest }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(action: () => Promise<{ error?: string } | undefined>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const createdLabel = new Date(request.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="card flex items-center gap-4 p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">{request.userName || "Пользователь"}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              request.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"
            }`}
          >
            {request.status === "pending" ? "Ожидает" : "Обработана"}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {request.userPhone || "Телефон не указан"} · заявка от {createdLabel}
        </p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>

      {request.status === "pending" && (
        <div className="flex shrink-0 items-center gap-2 text-sm">
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => resolveDataRequestAction(request.id))}
            className="btn-secondary py-1.5"
          >
            Отметить обработанной
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (
                !confirm(
                  "Удалить аккаунт пользователя полностью (объявления, бизнес-профиль, отзывы) без возможности восстановления?"
                )
              )
                return;
              run(() => deleteUserAccountAction(request.id, request.userId));
            }}
            className="btn-secondary py-1.5 text-red-600"
          >
            Удалить аккаунт
          </button>
        </div>
      )}
    </div>
  );
}
