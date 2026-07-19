"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImageOff, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export function ListingGallery({
  images,
  title,
  isVip,
}: {
  images: { id: number; url: string }[];
  title: string;
  isVip?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground/50 sm:h-[440px]">
        <ImageOff className="h-10 w-10" strokeWidth={1.2} />
      </div>
    );
  }

  const current = images[index] ?? images[0]!;

  return (
    <div>
      <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-border bg-muted sm:h-[440px]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group block h-full w-full cursor-zoom-in"
          aria-label="Открыть фото на весь экран"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={title} className="h-full w-full object-contain" />
          <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-sm transition group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </span>
        </button>

        {isVip && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-sm">
            VIP
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm transition hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-2 left-2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition ${
                i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={title}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i - 1 + images.length) % images.length);
                  }}
                  aria-label="Предыдущее фото"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i + 1) % images.length);
                  }}
                  aria-label="Следующее фото"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                  {index + 1} / {images.length}
                </span>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
