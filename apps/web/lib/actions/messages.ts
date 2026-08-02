"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";

const messageBodySchema = z.string().trim().min(1, "Введите сообщение").max(2000);

// Открывает тред с продавцом объявления (или переиспользует уже существующий)
// и сразу отправляет первое сообщение — вызывается с карточки объявления.
export async function startConversationAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const listingId = String(formData.get("listingId") ?? "");
  const bodyResult = messageBodySchema.safeParse(formData.get("body"));
  if (!listingId) return { error: "Некорректное объявление" };
  if (!bodyResult.success) return { error: bodyResult.error.issues[0]?.message };

  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", listingId)
    .single();
  if (!listing) return { error: "Объявление не найдено" };
  if (listing.user_id === user.id) return { error: "Нельзя написать самому себе" };

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;

  if (!conversationId) {
    const { data: created, error: createError } = await supabase
      .from("conversations")
      .insert({ listing_id: listingId, buyer_id: user.id, seller_id: listing.user_id })
      .select("id")
      .single();
    if (createError) return { error: "Не получилось начать диалог: " + createError.message };
    conversationId = created.id;
  }

  const { error: messageError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: bodyResult.data });
  if (messageError) return { error: "Не получилось отправить сообщение: " + messageError.message };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  redirect(`/messages/${conversationId}`);
}

export async function sendMessageAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const conversationId = String(formData.get("conversationId") ?? "");
  const bodyResult = messageBodySchema.safeParse(formData.get("body"));
  if (!conversationId) return { error: "Некорректный диалог" };
  if (!bodyResult.success) return { error: bodyResult.error.issues[0]?.message };

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id")
    .eq("id", conversationId)
    .single();
  if (!conversation || (conversation.buyer_id !== user.id && conversation.seller_id !== user.id)) {
    return { error: "Диалог не найден" };
  }

  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: bodyResult.data });
  if (error) return { error: "Не получилось отправить: " + error.message };

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { success: "Отправлено" };
}

// Отмечает чужие сообщения в треде прочитанными — вызывается при открытии треда.
export async function markConversationReadAction(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}
