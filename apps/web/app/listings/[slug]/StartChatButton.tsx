"use client";

import { useActionState, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { startConversationAction } from "@/lib/actions/messages";
import type { AuthActionState } from "@/lib/actions/auth";

export function StartChatButton({ listingId, isAuthenticated }: { listingId: string; isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(startConversationAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        <MessageSquare className="h-4 w-4" />
        Написать в чате
      </a>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
      >
        <MessageSquare className="h-4 w-4" />
        Написать в чате
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        formAction(new FormData(e.currentTarget));
      }}
      className="space-y-2"
    >
      <input type="hidden" name="listingId" value={listingId} />
      <textarea
        name="body"
        required
        autoFocus
        rows={2}
        placeholder="Здравствуйте, ещё актуально?"
        className="field-input mt-0"
      />
      {state?.error && <p className="text-xs text-red-700">{state.error}</p>}
      <button type="submit" disabled={isPending} className="btn-primary w-full py-2">
        {isPending ? "Отправляем..." : "Отправить сообщение"}
      </button>
    </form>
  );
}
