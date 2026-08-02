"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "bazar-theme";

// Тема по умолчанию всегда светлая, независимо от настроек ОС — тёмная
// включается только этой кнопкой и запоминается в localStorage. Блокирующий
// скрипт в <head> (layout.tsx) применяет сохранённый выбор до отрисовки,
// чтобы не было вспышки не той темы при загрузке.
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      setTheme("dark");
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage недоступен (приватный режим и т.п.) — тема просто не запомнится
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-card-hover transition hover:-translate-y-0.5 hover:border-border-strong active:translate-y-0"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
