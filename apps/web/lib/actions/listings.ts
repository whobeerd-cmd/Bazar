"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth";

const listingSchema = z.object({
  title: z.string().trim().min(5, "Заголовок должен быть не короче 5 символов").max(100),
  categoryId: z.coerce.number().int().positive("Выберите категорию"),
  cityId: z.coerce.number().int().positive("Выберите населённый пункт"),
  description: z.string().trim().min(20, "Описание должно быть не короче 20 символов"),
  price: z.union([z.coerce.number().nonnegative(), z.literal("")]).optional(),
  priceType: z.enum(["fixed", "negotiable", "free"]),
  condition: z.enum(["new", "used"]),
  dealType: z.enum(["sale", "rent_out", "buy", "rent_seek"]).optional(),
  addressText: z.string().trim().optional(),
  lat: z.union([z.coerce.number(), z.literal("")]).optional(),
  lng: z.union([z.coerce.number(), z.literal("")]).optional(),
});

async function getOwnListingOrThrow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  userId: string
) {
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", listingId)
    .single();

  if (!listing || listing.user_id !== userId) {
    throw new Error("Объявление не найдено");
  }
  return listing;
}

// Извлекает и сохраняет значения динамических атрибутов категории (attr_<id> в formData)
async function saveListingAttributes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  categoryId: number,
  formData: FormData
) {
  const { data: attributes } = await supabase
    .from("category_attributes")
    .select("id, type, is_required, name")
    .eq("category_id", categoryId);

  if (!attributes || attributes.length === 0) return null;

  const rows: { listing_id: string; attribute_id: number; value: Record<string, unknown> }[] = [];

  for (const attr of attributes) {
    const raw = formData.get(`attr_${attr.id}`);

    if (attr.type === "bool") {
      rows.push({ listing_id: listingId, attribute_id: attr.id, value: { value: raw === "on" } });
      continue;
    }

    const strValue = raw ? String(raw).trim() : "";

    if (!strValue) {
      if (attr.is_required) {
        return `Заполните поле «${attr.name}»`;
      }
      continue;
    }

    if (attr.type === "number") {
      const num = Number(strValue);
      if (Number.isNaN(num)) return `«${attr.name}» должно быть числом`;
      rows.push({ listing_id: listingId, attribute_id: attr.id, value: { value: num } });
    } else {
      rows.push({ listing_id: listingId, attribute_id: attr.id, value: { value: strValue } });
    }
  }

  await supabase.from("listing_attributes").delete().eq("listing_id", listingId);
  if (rows.length > 0) {
    const { error } = await supabase.from("listing_attributes").insert(rows);
    if (error) return "Не получилось сохранить характеристики: " + error.message;
  }

  return null;
}

function parsedListingPayload(parsed: z.infer<typeof listingSchema>) {
  return {
    title: parsed.title,
    category_id: parsed.categoryId,
    city_id: parsed.cityId,
    description: parsed.description,
    price: parsed.priceType === "fixed" ? Number(parsed.price) || 0 : null,
    price_type: parsed.priceType,
    condition: parsed.condition,
    deal_type: parsed.dealType ?? null,
    address_text: parsed.addressText || null,
    lat: parsed.lat !== undefined && parsed.lat !== "" ? Number(parsed.lat) : null,
    lng: parsed.lng !== undefined && parsed.lng !== "" ? Number(parsed.lng) : null,
  };
}

// ----------------------------------------------------------------------------
// Создание черновика — редиректит на страницу редактирования, где уже можно
// загружать фото и отправлять объявление на модерацию.
// ----------------------------------------------------------------------------
export async function createListingAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    cityId: formData.get("cityId"),
    description: formData.get("description"),
    price: formData.get("price") ?? "",
    priceType: formData.get("priceType"),
    condition: formData.get("condition"),
    dealType: formData.get("dealType") || undefined,
    addressText: formData.get("addressText"),
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({ user_id: user.id, status: "draft", ...parsedListingPayload(parsed.data) })
    .select("id")
    .single();

  if (error) return { error: "Не получилось создать объявление: " + error.message };

  const attrError = await saveListingAttributes(supabase, data.id, parsed.data.categoryId, formData);
  if (attrError) return { error: attrError };

  redirect(`/my-ads/${data.id}/edit`);
}

// ----------------------------------------------------------------------------
// Сохранение изменений (доступно, пока объявление не отправлено на модерацию,
// либо для правок уже опубликованного/отклонённого объявления)
// ----------------------------------------------------------------------------
export async function updateListingAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Некорректный id объявления" };

  const listing = await getOwnListingOrThrow(supabase, id, user.id).catch((e) => {
    return null;
  });
  if (!listing) return { error: "Объявление не найдено" };

  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    cityId: formData.get("cityId"),
    description: formData.get("description"),
    price: formData.get("price") ?? "",
    priceType: formData.get("priceType"),
    condition: formData.get("condition"),
    dealType: formData.get("dealType") || undefined,
    addressText: formData.get("addressText"),
    lat: formData.get("lat") ?? "",
    lng: formData.get("lng") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  // Правки не сбрасывают статус — объявление остаётся опубликованным как было.
  const { error } = await supabase
    .from("listings")
    .update({ ...parsedListingPayload(parsed.data), status: listing.status })
    .eq("id", id);

  if (error) return { error: "Не получилось сохранить: " + error.message };

  const attrError = await saveListingAttributes(supabase, id, parsed.data.categoryId, formData);
  if (attrError) return { error: attrError };

  revalidatePath(`/my-ads/${id}/edit`);
  revalidatePath("/my-ads");
  return { success: "Изменения сохранены" };
}

// ----------------------------------------------------------------------------
// Публикация черновика/отклонённого объявления — сразу активно, без очереди
// на модерацию.
// ----------------------------------------------------------------------------
export async function publishListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const listing = await getOwnListingOrThrow(supabase, listingId, user.id).catch(() => null);
  if (!listing) return { error: "Объявление не найдено" };
  if (!["draft", "rejected"].includes(listing.status)) {
    return { error: "Опубликовать можно только черновик или отклонённое объявление" };
  }

  const { count } = await supabase
    .from("listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (!count || count === 0) {
    return { error: "Добавьте хотя бы одно фото перед публикацией" };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "active", rejection_reason: null })
    .eq("id", listingId);

  if (error) return { error: error.message };

  revalidatePath("/my-ads");
  revalidatePath(`/my-ads/${listingId}/edit`);
  revalidatePath("/admin/listings");
  return { success: "Объявление опубликовано" };
}

// ----------------------------------------------------------------------------
// Поднять объявление в списке — бесплатно, не чаще раза в 24 часа.
// Технически: sort_priority выставляется в "сейчас", как будто объявление
// опубликовано заново (см. lib/listings/query.ts — сортировка по умолчанию).
// ----------------------------------------------------------------------------
const BOOST_COOLDOWN_HOURS = 24;

export async function boostListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { data: listing } = await supabase
    .from("listings")
    .select("status, boosted_at")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing) return { error: "Объявление не найдено" };
  if (listing.status !== "active") {
    return { error: "Поднять в списке можно только опубликованное объявление" };
  }

  if (listing.boosted_at) {
    const hoursSince = (Date.now() - new Date(listing.boosted_at).getTime()) / 3_600_000;
    if (hoursSince < BOOST_COOLDOWN_HOURS) {
      const hoursLeft = Math.ceil(BOOST_COOLDOWN_HOURS - hoursSince);
      return { error: `Поднимать можно раз в ${BOOST_COOLDOWN_HOURS} ч — осталось ${hoursLeft} ч` };
    }
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("listings")
    .update({ boosted_at: now, sort_priority: now })
    .eq("id", listingId);

  if (error) return { error: error.message };

  revalidatePath("/my-ads");
  return { success: "Объявление поднято в списке" };
}

// ----------------------------------------------------------------------------
// Архивация / отметка "продано" / удаление черновика
// ----------------------------------------------------------------------------
export async function archiveListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { error } = await supabase
    .from("listings")
    .update({ status: "archived" })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/my-ads");
  return { success: true };
}

export async function markSoldAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { error } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/my-ads");
  return { success: true };
}

export async function deleteListingAction(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { data: listing } = await supabase
    .from("listings")
    .select("status")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing || listing.status !== "draft") {
    return { error: "Удалить можно только черновик — остальное можно архивировать" };
  }

  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) return { error: error.message };

  revalidatePath("/my-ads");
  return { success: true };
}

// ----------------------------------------------------------------------------
// Фото: запись строк в БД после того, как файл уже загружен в Storage на клиенте
// ----------------------------------------------------------------------------
export async function addListingImagesAction(listingId: string, urls: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Нужно войти в аккаунт" };

  const { count } = await supabase
    .from("listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  const startOrder = count ?? 0;
  const rows = urls.map((url, i) => ({ listing_id: listingId, url, sort_order: startOrder + i }));

  const { error } = await supabase.from("listing_images").insert(rows);
  if (error) return { error: error.message };

  revalidatePath(`/my-ads/${listingId}/edit`);
  return { success: true };
}

export async function removeListingImageAction(imageId: number, listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("listing_images").delete().eq("id", imageId);
  if (error) return { error: error.message };

  revalidatePath(`/my-ads/${listingId}/edit`);
  return { success: true };
}

// ----------------------------------------------------------------------------
// Жалоба на объявление
// ----------------------------------------------------------------------------
const complaintSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(["prohibited", "scam", "duplicate", "wrong_category", "other"]),
  comment: z.string().trim().max(500).optional(),
});

export async function reportListingAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Чтобы пожаловаться, войдите в аккаунт" };

  const parsed = complaintSchema.safeParse({
    listingId: formData.get("listingId"),
    reason: formData.get("reason"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase.from("complaints").insert({
    listing_id: parsed.data.listingId,
    user_id: user.id,
    reason: parsed.data.reason,
    comment: parsed.data.comment || null,
  });

  if (error) return { error: "Не получилось отправить жалобу: " + error.message };
  return { success: "Жалоба отправлена, спасибо — мы проверим объявление" };
}
