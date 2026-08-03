"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

const DISMISS_KEY = "bazar-install-dismissed";

// Android/Chrome/Edge реально ставят приложение в один тап через это
// событие. iOS Safari его никогда не пришлёт — Apple намеренно не даёт
// сайтам вызывать установку программно, только через шторку "Поделиться",
// поэтому там показываем инструкцию вместо кнопки с тем же эффектом.
export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (isStandalone || dismissed) return;

    if (ios) {
      setVisible(true);
      return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setShowIOSHelp(false);
  }

  async function handleInstall() {
    if (isIOS) {
      setShowIOSHelp(true);
      return;
    }
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") dismiss();
    else setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="border-b border-border bg-primary/5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 text-sm">
        <Download className="h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 text-foreground">Установите Bazar на телефон — быстрый доступ в один тап, без браузера</p>
        <button type="button" onClick={handleInstall} className="btn-primary shrink-0 py-1.5 px-3 text-xs">
          Установить
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Скрыть"
          className="shrink-0 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showIOSHelp && (
        <div className="border-t border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          <div className="mx-auto max-w-6xl space-y-1.5">
            <p className="flex items-center gap-1.5">
              1. Нажмите <Share className="h-3.5 w-3.5 shrink-0" /> «Поделиться» внизу экрана Safari
            </p>
            <p className="flex items-center gap-1.5">
              2. Выберите <SquarePlus className="h-3.5 w-3.5 shrink-0" /> «На экран «Домой»»
            </p>
            <button type="button" onClick={dismiss} className="mt-1 text-xs font-semibold text-primary hover:underline">
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
