"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Имя должно быть не короче 2 символов"),
  phone: z
    .string()
    .trim()
    .regex(/^$|^\+?[0-9]{10,15}$/, "Введите телефон в формате +79991234567")
    .optional(),
});

export async function updateProfileAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Сессия истекла, войдите заново" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Не получилось сохранить профиль: " + error.message };
  }

  revalidatePath("/profile");
  return { success: "Профиль обновлён" };
}

// Вызывается после того, как файл аватарки уже загружен в Storage на клиенте —
// здесь только сохраняем итоговый публичный URL в профиль.
export async function updateAvatarUrlAction(avatarUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Сессия истекла" };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}
