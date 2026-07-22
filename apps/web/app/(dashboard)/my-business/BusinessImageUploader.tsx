"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { addBusinessImagesAction, removeBusinessImageAction } from "@/lib/actions/business";

export type BusinessImage = { id: number; url: string };

const MAX_PHOTOS = 10;

export function BusinessImageUploader({
  userId,
  businessId,
  initialImages,
}: {
  userId: string;
  businessId: string;
  initialImages: BusinessImage[];
}) {
  const [images, setImages] = useState<BusinessImage[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setError(null);

    if (images.length + files.length > MAX_PHOTOS) {
      setError(`Максимум ${MAX_PHOTOS} фото`);
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
        const path = `${userId}/${businessId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

        const { error: uploadError } = await supabase.storage.from("listing-media").upload(path, file);

        if (uploadError) {
          setError("Не получилось загрузить файл: " + uploadError.message);
          return;
        }

        const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }

      const result = await addBusinessImagesAction(businessId, uploadedUrls);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setImages((prev) => [...prev, ...uploadedUrls.map((url, i) => ({ id: -1 * (Date.now() + i), url }))]);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  async function handleRemove(image: BusinessImage) {
    setError(null);
    startTransition(async () => {
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      if (image.id > 0) {
        const result = await removeBusinessImageAction(image.id, businessId);
        if (result?.error) setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted">
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
          className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground transition hover:border-border-strong hover:bg-muted disabled:opacity-60"
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

      <p className="mt-2 text-xs text-muted-foreground">До {MAX_PHOTOS} фото, каждое не больше 10 МБ.</p>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
