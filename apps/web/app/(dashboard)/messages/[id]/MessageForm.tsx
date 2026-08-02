"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessageAction } from "@/lib/actions/messages";
import type { AuthActionState } from "@/lib/actions/auth";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(sendMessageAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        formAction(new FormData(e.currentTarget));
      }}
      className="mt-3 flex items-end gap-2 border-t border-border pt-3"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea
        name="body"
        required
        rows={1}
        placeholder="Напишите сообщение..."
        className="field-input mt-0 flex-1 resize-none"
      />
      <button type="submit" disabled={isPending} className="btn-primary shrink-0 py-2.5">
        {isPending ? "..." : "Отправить"}
      </button>
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
    </form>
  );
}
