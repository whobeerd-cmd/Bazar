"use server";

import { createClient } from "@/lib/supabase/server";

// Заявка на удаление аккаунта и персональных данных — замена email-обращению
// по 152-ФЗ. Видна администрации в /admin/data-requests.
export async function requestDataDeletionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { data: existing } = await supabase
    .from("data_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { success: "Заявка уже отправлена — мы её обрабатываем" };

  const { error } = await supabase.from("data_requests").insert({ user_id: user.id });
  if (error) return { error: "Не получилось отправить заявку: " + error.message };

  return { success: "Заявка отправлена — обычно обрабатывается в течение нескольких дней" };
}
