"use client";

import { useActionState, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBannerAction } from "@/lib/actions/admin/banners";
import type { AuthActionState } from "@/lib/actions/auth";

export function BannerForm() {
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    createBannerAction,
    null
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);

    const extension = file.name.split(".").pop();
    const path = `banners/${Date.now()}.${extension}`;
    const supabase = createClient();

    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    if (error) {
      setUploadError("Не получилось загрузить картинку: " + error.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setIsUploading(false);
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />

      <div>
        <label className="field-label">Картинка баннера</label>
        <div className="mt-1 flex items-center gap-3">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-12 w-24 rounded border border-border object-cover" />
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary py-1.5"
          >
            {isUploading ? "Загружаем..." : imageUrl ? "Заменить картинку" : "Загрузить картинку"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {uploadError && <p className="mt-1 text-xs text-red-700">{uploadError}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="field-label">Ссылка при клике</label>
          <input
            name="linkUrl"
            placeholder="/category/nedvizhimost"
            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
          />
        </div>
        <div>
          <label className="field-label">Место показа</label>
          <select
            name="position"
            defaultValue="home_top"
            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
          >
            <option value="home_top">Верх главной</option>
            <option value="home_middle">Середина главной</option>
            <option value="sidebar">Боковая колонка</option>
          </select>
        </div>
        <div>
          <label className="field-label">Порядок</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none transition focus:border-border-strong focus:ring-2 focus:ring-primary/25"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked />
        Показывать сразу
      </label>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>
      )}

      <button type="submit" disabled={isPending || !imageUrl} className="btn-primary">
        {isPending ? "Сохраняем..." : "Добавить баннер"}
      </button>
      {!imageUrl && (
        <p className="text-xs text-muted-foreground">Сначала загрузите картинку</p>
      )}
    </form>
  );
}
