"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { addListingImagesAction, removeListingImageAction } from "@/lib/actions/listings";

export type ListingImage = { id: number; url: string };

export function ImageUploader({
  userId,
  listingId,
  initialImages,
}: {
  userId: string;
  listingId: string;
  initialImages: ListingImage[];
}) {
  const [images, setImages] = useState<ListingImage[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setError(null);

    if (images.length + files.length > 12) {
      setError("Максимум 12 фото на объявление");
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`Файл «${file.name}» слишком большой (максимум 10 МБ)`);
        return;
      }
    }

    startTransition(async () => {
      const supabase = createClient();
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const extension = file.name.split(".").pop();
        const path = `${userId}/${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-media")
          .upload(path, file);

        if (uploadError) {
          setError("Не получилось загрузить файл: " + uploadError.message);
          return;
        }

        const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      const result = await addListingImagesAction(listingId, uploadedUrls);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setImages((prev) => [
        ...prev,
        ...uploadedUrls.map((url, i) => ({ id: -1 * (Date.now() + i), url })),
      ]);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  async function handleRemove(image: ListingImage) {
    setError(null);
    startTransition(async () => {
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      if (image.id > 0) {
        const result = await removeListingImageAction(image.id, listingId);
        if (result?.error) setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="group relative h-24 w-24 overflow-hidden rounded-md bg-muted">
            <Image src={image.url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(image)}
              className="absolute right-1 top-1 hidden rounded bg-black/60 px-1.5 py-0.5 text-xs text-white group-hover:block"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted disabled:opacity-60"
        >
          {isPending ? "Загружаем..." : "+ Фото"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />

      <p className="mt-2 text-xs text-muted-foreground">До 12 фото, каждое не больше 10 МБ.</p>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
