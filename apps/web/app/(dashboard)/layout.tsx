"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/profile", label: "Профиль" },
  { href: "/my-ads", label: "Мои объявления" },
  { href: "/favorites", label: "Избранное" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:gap-8">
      <aside className="shrink-0 sm:w-52">
        <nav className="flex gap-1 overflow-x-auto text-sm sm:block sm:space-y-1 sm:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block shrink-0 rounded-lg px-3 py-2 font-medium transition ${
                  active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <form action={signOutAction} className="contents">
            <button
              type="submit"
              className="shrink-0 rounded-lg px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50 sm:mt-3 sm:block sm:w-full"
            >
              Выйти
            </button>
          </form>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
