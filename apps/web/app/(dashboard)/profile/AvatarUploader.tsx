"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateAvatarUrlAction } from "@/lib/actions/profile";

export function AvatarUploader({
  userId,
  currentAvatarUrl,
}: {
  userId: string;
  currentAvatarUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой (максимум 5 МБ)");
      return;
    }

    const extension = file.name.split(".").pop();
    const path = `${userId}/avatar.${extension}`;
    const supabase = createClient();

    startTransition(async () => {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError("Не получилось загрузить файл: " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Добавляем метку времени, чтобы браузер не показывал закэшированную старую картинку
      const freshUrl = `${data.publicUrl}?t=${Date.now()}`;

      const result = await updateAvatarUrlAction(freshUrl);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setAvatarUrl(freshUrl);
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
        {avatarUrl ? (
          <Image src={avatarUrl} alt="Аватар" width={64} height={64} className="h-16 w-16 object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center text-xs text-muted-foreground">
            нет фото
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-60"
        >
          {isPending ? "Загружаем..." : "Сменить фото"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}
