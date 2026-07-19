"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Резервный путь для писем со стандартным шаблоном Supabase: сессия приходит
// в #фрагменте адреса (виден только в браузере), а не в query — забираем её
// отсюда и продолжаем вход, как будто ссылка сработала сразу.
export function ConfirmFallback() {
  const [status, setStatus] = useState<"checking" | "invalid">("checking");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setStatus("invalid");
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (!accessToken || !refreshToken) {
      setStatus("invalid");
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      if (error) {
        setStatus("invalid");
        return;
      }
      window.location.replace(type === "recovery" ? "/update-password" : "/");
    });
  }, []);

  if (status === "checking") {
    return <p className="text-center text-sm text-muted-foreground">Входим...</p>;
  }

  return (
    <div className="text-center">
      <p className="text-sm text-red-700">Ссылка недействительна или уже была использована.</p>
      <a href="/login" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
        Вернуться ко входу
      </a>
    </div>
  );
}
