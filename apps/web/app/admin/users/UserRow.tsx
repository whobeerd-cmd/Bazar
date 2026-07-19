"use client";

import { useState, useTransition } from "react";
import { toggleUserBlockedAction, toggleUserRoleAction, type ManageableRole } from "@/lib/actions/admin/users";

export type AdminUser = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_blocked: boolean;
  created_at: string;
  last_seen_at: string | null;
  roleCodes: string[];
};

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function formatLastSeen(lastSeenAt: string | null) {
  if (!lastSeenAt) return "ещё не заходил(а)";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  if (diffMs < ONLINE_WINDOW_MS) return null; // онлайн — отдельный бейдж
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `был(а) в сети ${diffMin} мин назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `был(а) в сети ${diffH} ч назад`;
  const diffD = Math.floor(diffH / 24);
  return `был(а) в сети ${diffD} дн назад`;
}

export function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const hasRole = (code: ManageableRole) => user.roleCodes.includes(code);
  const isOnline =
    !!user.last_seen_at && Date.now() - new Date(user.last_seen_at).getTime() < ONLINE_WINDOW_MS;
  const registeredAt = new Date(user.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function run(action: () => Promise<{ error?: string } | undefined>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="card flex items-center gap-4 p-3">
      <div className="relative shrink-0">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {(user.full_name || "П").charAt(0)}
          </div>
        )}
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500"
            title="Онлайн"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">
          {user.full_name || "Без имени"}
          {isSelf && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(вы)</span>}
        </p>
        <p className="text-sm text-muted-foreground">{user.phone || "Телефон не указан"}</p>
        <p className="text-xs text-muted-foreground">
          Регистрация: {registeredAt}
          {isOnline ? (
            <span className="ml-2 font-medium text-green-700">онлайн</span>
          ) : (
            formatLastSeen(user.last_seen_at) && <span className="ml-2">{formatLastSeen(user.last_seen_at)}</span>
          )}
        </p>
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>

      {user.is_blocked && (
        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          заблокирован
        </span>
      )}

      <div className="flex shrink-0 items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={hasRole("moderator")}
            disabled={isPending || isSelf}
            onChange={(e) => run(() => toggleUserRoleAction(user.id, "moderator", e.target.checked))}
          />
          Модератор
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={hasRole("admin")}
            disabled={isPending || isSelf}
            onChange={(e) => run(() => toggleUserRoleAction(user.id, "admin", e.target.checked))}
          />
          Админ
        </label>

        <button
          type="button"
          disabled={isPending || isSelf}
          onClick={() => {
            const next = !user.is_blocked;
            if (next && !confirm(`Заблокировать пользователя "${user.full_name || "без имени"}"?`)) return;
            run(() => toggleUserBlockedAction(user.id, next));
          }}
          className="btn-secondary py-1.5 disabled:opacity-40"
        >
          {user.is_blocked ? "Разблокировать" : "Заблокировать"}
        </button>
      </div>
    </div>
  );
}
