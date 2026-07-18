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
  roleCodes: string[];
};

export function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const hasRole = (code: ManageableRole) => user.roleCodes.includes(code);

  function run(action: () => Promise<{ error?: string } | undefined>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="card flex items-center gap-4 p-3">
      {user.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar_url} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {(user.full_name || "П").charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">
          {user.full_name || "Без имени"}
          {isSelf && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(вы)</span>}
        </p>
        <p className="text-sm text-muted-foreground">{user.phone || "Телефон не указан"}</p>
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
