"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";

const commentSchema = z.object({
  listingId: z.string().uuid(),
  slug: z.string().min(1),
  body: z.string().trim().min(1, "Комментарий не может быть пустым").max(1000, "Слишком длинный комментарий"),
});

export async function addCommentAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Чтобы оставить комментарий, войдите в аккаунт" };

  const parsed = commentSchema.safeParse({
    listingId: formData.get("listingId"),
    slug: formData.get("slug"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase.from("listing_comments").insert({
    listing_id: parsed.data.listingId,
    user_id: user.id,
    body: parsed.data.body,
  });

  if (error) return { error: "Не получилось отправить комментарий: " + error.message };

  revalidatePath(`/listings/${parsed.data.slug}`);
  return { success: "Комментарий добавлен" };
}

export async function deleteCommentAction(commentId: number, slug: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("listing_comments").delete().eq("id", commentId);
  if (error) return { error: error.message };

  revalidatePath(`/listings/${slug}`);
  return { success: true };
}
