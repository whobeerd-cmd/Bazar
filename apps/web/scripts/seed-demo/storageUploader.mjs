import { serviceClient } from "./supabaseClients.mjs";

// Заливаем файл в тот же бакет и по тем же правилам пути, что и обычная
// загрузка фото объявления ({userId}/{listingId}/{filename}) — никаких
// хотлинков на внешний источник, фото реально хранится у нас.
export async function uploadImageToStorage({ buffer, userId, listingId, index }) {
  const path = `${userId}/${listingId}/${Date.now()}-${index}.jpg`;

  const { error } = await serviceClient.storage
    .from("listing-media")
    .upload(path, buffer, { contentType: "image/jpeg", upsert: false });

  if (error) throw new Error(`Не удалось загрузить фото в storage: ${error.message}`);

  const { data } = serviceClient.storage.from("listing-media").getPublicUrl(path);
  return data.publicUrl;
}
