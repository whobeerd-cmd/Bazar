"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const businessSchema = z.object({
  name: z.string().trim().min(2, "Название должно быть не короче 2 символов").max(100),
  categoryId: z.coerce.number().int().positive("Выберите раздел"),
  cityId: z.coerce.number().int().positive("Выберите населённый пункт"),
  description: z.string().trim().min(20, "Описание должно быть не короче 20 символов"),
  addressText: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

function parseHours(formData: FormData) {
  const hours: Record<string, { open: string; close: string; closed: boolean }> = {};
  for (const day of DAYS) {
    const closed = formData.get(`hours_${day}_closed`) === "on";
    hours[day] = {
      open: String(formData.get(`hours_${day}_open`) ?? "09:00"),
      close: String(formData.get(`hours_${day}_close`) ?? "18:00"),
      closed,
    };
  }
  return hours;
}

function parsedBusinessPayload(parsed: z.infer<typeof businessSchema>, formData: FormData) {
  return {
    name: parsed.name,
    category_id: parsed.categoryId,
    city_id: parsed.cityId,
    description: parsed.description,
    address_text: parsed.addressText || null,
    phone: parsed.phone || null,
    whatsapp: parsed.whatsapp || null,
    instagram: parsed.instagram || null,
    website: parsed.website || null,
    hours: parseHours(formData),
  };
}

async function getOwnBusinessOrThrow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  userId: string
) {
  const { data: business } = await supabase
    .from("businesses")
    .select("id, owner_id, slug")
    .eq("id", businessId)
    .single();

  if (!business || business.owner_id !== userId) {
    throw new Error("Бизнес не найден");
  }
  return business;
}

// ----------------------------------------------------------------------------
// Создание бизнеса — публикуется сразу, без модерации.
// ----------------------------------------------------------------------------
export async function createBusinessAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    cityId: formData.get("cityId"),
    description: formData.get("description"),
    addressText: formData.get("addressText"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    instagram: formData.get("instagram"),
    website: formData.get("website"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { data, error } = await supabase
    .from("businesses")
    .insert({ owner_id: user.id, ...parsedBusinessPayload(parsed.data, formData) })
    .select("id")
    .single();

  if (error) return { error: "Не получилось создать бизнес: " + error.message };

  redirect(`/my-business/${data.id}/edit`);
}

export async function updateBusinessAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Некорректный id бизнеса" };

  const business = await getOwnBusinessOrThrow(supabase, id, user.id).catch(() => null);
  if (!business) return { error: "Бизнес не найден" };

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    cityId: formData.get("cityId"),
    description: formData.get("description"),
    addressText: formData.get("addressText"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    instagram: formData.get("instagram"),
    website: formData.get("website"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase
    .from("businesses")
    .update(parsedBusinessPayload(parsed.data, formData))
    .eq("id", id);

  if (error) return { error: "Не получилось сохранить: " + error.message };

  revalidatePath(`/my-business/${id}/edit`);
  revalidatePath("/my-business");
  revalidatePath(`/business/${business.slug}`);
  return { success: "Изменения сохранены" };
}

export async function deleteBusinessAction(businessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { error } = await supabase.from("businesses").delete().eq("id", businessId).eq("owner_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/my-business");
  return { success: true };
}

// Владелец может временно скрыть свой бизнес из справочника (например,
// закрылись на ремонт) и снова показать — без удаления отзывов/фото.
export async function toggleBusinessVisibilityAction(businessId: string, nextStatus: "active" | "hidden") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { error } = await supabase
    .from("businesses")
    .update({ status: nextStatus })
    .eq("id", businessId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/my-business");
  return { success: true };
}

// ----------------------------------------------------------------------------
// Фото бизнеса
// ----------------------------------------------------------------------------
const MAX_BUSINESS_PHOTOS = 10;

export async function addBusinessImagesAction(businessId: string, urls: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { count } = await supabase
    .from("business_images")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  const startOrder = count ?? 0;
  if (startOrder + urls.length > MAX_BUSINESS_PHOTOS) {
    return { error: `Максимум ${MAX_BUSINESS_PHOTOS} фото` };
  }

  const rows = urls.map((url, i) => ({ business_id: businessId, url, sort_order: startOrder + i }));
  const { error } = await supabase.from("business_images").insert(rows);
  if (error) return { error: error.message };

  revalidatePath(`/my-business/${businessId}/edit`);
  return { success: true };
}

export async function removeBusinessImageAction(imageId: number, businessId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("business_images").delete().eq("id", imageId);
  if (error) return { error: error.message };

  revalidatePath(`/my-business/${businessId}/edit`);
  return { success: true };
}

// ----------------------------------------------------------------------------
// Отзывы и рейтинг
// ----------------------------------------------------------------------------
const reviewSchema = z.object({
  businessId: z.string().uuid(),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(1000).optional(),
});

export async function submitReviewAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Чтобы оставить отзыв, войдите в аккаунт" };

  const parsed = reviewSchema.safeParse({
    businessId: formData.get("businessId"),
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { data: business } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("id", parsed.data.businessId)
    .single();

  if (business?.owner_id === user.id) {
    return { error: "Нельзя оставить отзыв на свой же бизнес" };
  }

  const { error } = await supabase.from("business_reviews").upsert(
    {
      business_id: parsed.data.businessId,
      user_id: user.id,
      rating: parsed.data.rating,
      body: parsed.data.body || null,
    },
    { onConflict: "business_id,user_id" }
  );

  if (error) return { error: "Не получилось отправить отзыв: " + error.message };

  revalidatePath(`/business/${parsed.data.slug}`);
  return { success: "Спасибо за отзыв!" };
}

export async function deleteReviewAction(reviewId: number, slug: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("business_reviews").delete().eq("id", reviewId);
  if (error) return { error: error.message };

  revalidatePath(`/business/${slug}`);
  return { success: true };
}

const replySchema = z.object({
  reviewId: z.coerce.number().int().positive(),
  businessId: z.string().uuid(),
  slug: z.string().min(1),
  reply: z.string().trim().min(1, "Ответ не может быть пустым").max(1000),
});

export async function replyToReviewAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const parsed = replySchema.safeParse({
    reviewId: formData.get("reviewId"),
    businessId: formData.get("businessId"),
    slug: formData.get("slug"),
    reply: formData.get("reply"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const business = await getOwnBusinessOrThrow(supabase, parsed.data.businessId, user.id).catch(() => null);
  if (!business) return { error: "Отвечать может только владелец бизнеса" };

  const { error } = await supabase
    .from("business_reviews")
    .update({ owner_reply: parsed.data.reply, owner_replied_at: new Date().toISOString() })
    .eq("id", parsed.data.reviewId)
    .eq("business_id", parsed.data.businessId);

  if (error) return { error: error.message };

  revalidatePath(`/business/${parsed.data.slug}`);
  return { success: "Ответ опубликован" };
}
