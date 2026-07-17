"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Дашборд" },
  { href: "/admin/listings", label: "Объявления" },
  { href: "/admin/complaints", label: "Жалобы" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/banners", label: "Баннеры" },
  { href: "/admin/settings", label: "Настройки сайта" },
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
            className={`block rounded-lg px-3 py-2 font-medium transition ${
              active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
