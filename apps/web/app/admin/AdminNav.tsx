"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Дашборд", hint: "Общая статистика сайта" },
  { href: "/admin/listings", label: "Объявления", hint: "Модерация и все объявления" },
  { href: "/admin/complaints", label: "Жалобы", hint: "Жалобы на объявления" },
  { href: "/admin/users", label: "Пользователи", hint: "Роли, блокировка" },
  { href: "/admin/categories", label: "Категории", hint: "Разделы каталога" },
  { href: "/admin/banners", label: "Баннеры", hint: "Реклама на главной" },
  { href: "/admin/settings", label: "Настройки сайта", hint: "Название, лого, контакты" },
  { href: "/admin/audit-log", label: "Журнал действий", hint: "Кто что менял" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 transition ${
              active ? "bg-primary/10" : "hover:bg-muted"
            }`}
          >
            <span className={`block font-medium ${active ? "text-primary" : "text-foreground"}`}>
              {item.label}
            </span>
            <span className="block text-xs text-muted-foreground">{item.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
}
