"use client";

import { useState, useTransition } from "react";
import { requestDataDeletionAction } from "@/lib/actions/dataRequests";

export function DeleteDataRequestButton({ hasPendingRequest }: { hasPendingRequest: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    hasPendingRequest ? { type: "success", text: "Заявка уже отправлена — мы её обрабатываем" } : null
  );

  function handleClick() {
    if (!confirm("Запросить удаление аккаунта и всех персональных данных? Это необратимо.")) return;
    setMessage(null);
    startTransition(async () => {
      const result = await requestDataDeletionAction();
      if (result?.error) setMessage({ type: "error", text: result.error });
      else if (result?.success) setMessage({ type: "success", text: result.success });
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || hasPendingRequest}
        className="text-sm font-medium text-red-600 underline underline-offset-4 hover:text-red-700 disabled:opacity-50"
      >
        Удалить аккаунт и мои данные
      </button>
      {message && (
        <p className={`mt-1.5 text-xs ${message.type === "error" ? "text-red-700" : "text-muted-foreground"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
