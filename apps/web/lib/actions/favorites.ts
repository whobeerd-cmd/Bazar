"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(listingId: string, shouldFavorite: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  if (shouldFavorite) {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, listing_id: listingId });
    // 23505 — уже в избранном (повторный клик), не считаем ошибкой
    if (error && error.code !== "23505") return { error: error.message };
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);
    if (error) return { error: error.message };
  }

  revalidatePath("/favorites");
  return { success: true };
}
