"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "bazar-install-dismissed";

type Instructions = "safari" | "chrome-ios" | "other-ios" | "android" | null;

function detectPlatform(ua: string): { isMobile: boolean; instructions: Instructions } {
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);

  if (isIOS) {
    if (/CriOS/i.test(ua)) return { isMobile: true, instructions: "chrome-ios" };
    if (/FxiOS|EdgiOS|YaBrowser|OPiOS/i.test(ua)) return { isMobile: true, instructions: "other-ios" };
    return { isMobile: true, instructions: "safari" };
  }
  if (isAndroid) return { isMobile: true, instructions: "android" };
  return { isMobile: false, instructions: null };
}

// Android/Chrome реально ставят приложение в один тап через это событие —
// когда оно есть, кнопка вызывает его напрямую. Если событие не пришло
// (другой браузер, ещё не выполнены внутренние условия Chrome) или это
// iOS, где такого API вообще нет — показываем шаги для конкретного
// браузера вместо бездействующей кнопки.
export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);
  const [instructions, setInstructions] = useState<Instructions>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    if (isStandalone || dismissed) return;

    const { isMobile, instructions: detected } = detectPlatform(navigator.userAgent);
    if (!isMobile) return;

    setInstructions(detected);
    setVisible(true);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setShowHelp(false);
  }

  async function handleInstall() {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      setDeferredPrompt(null);
      if (outcome === "accepted") dismiss();
      return;
    }
    setShowHelp(true);
  }

  if (!visible) return null;

  return (
    <div className="border-b border-border bg-primary/5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 text-sm">
        <Download className="h-4 w-4 shrink-0 text-primary" />
        <p className="flex-1 text-foreground">Установите Bazar на телефон — быстрый доступ без браузера</p>
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

      {showHelp && (
        <div className="border-t border-border bg-background px-4 py-3 text-sm text-muted-foreground">
          <div className="mx-auto max-w-6xl space-y-1">
            {instructions === "safari" && (
              <>
                <p>1. Нажмите значок «Поделиться» (квадрат со стрелкой вверх) в Safari</p>
                <p>2. Пролистайте список вниз и выберите «На экран «Домой»»</p>
              </>
            )}
            {instructions === "chrome-ios" && (
              <>
                <p>1. Нажмите «···» внизу экрана в Chrome</p>
                <p>2. Выберите «Добавить на экран «Домой»»</p>
              </>
            )}
            {instructions === "other-ios" && (
              <>
                <p>В вашем браузере одним касанием не получится — на iPhone это умеет только Safari.</p>
                <p>Откройте bazar06.ru в Safari, нажмите «Поделиться» → «На экран «Домой»».</p>
              </>
            )}
            {instructions === "android" && (
              <>
                <p>1. Откройте меню браузера (обычно «⋮» в правом верхнем углу)</p>
                <p>2. Выберите «Установить приложение» или «Добавить на главный экран»</p>
              </>
            )}
            <button type="button" onClick={dismiss} className="mt-1 text-xs font-semibold text-primary hover:underline">
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
