"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateLogoUrlAction } from "@/lib/actions/admin/settings";

export function LogoUploader({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    const extension = file.name.split(".").pop();
    const path = `logo/logo-${Date.now()}.${extension}`;
    const supabase = createClient();

    startTransition(async () => {
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError("Не получилось загрузить файл: " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      const result = await updateLogoUrlAction(data.publicUrl);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setLogoUrl(data.publicUrl);
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {logoUrl ? (
          <Image src={logoUrl} alt="Лого" width={64} height={64} className="h-16 w-16 object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground">нет лого</span>
        )}
      </div>
      <div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="btn-secondary py-1.5"
        >
          {isPending ? "Загружаем..." : "Загрузить лого"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    </div>
  );
}
