import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: categoriesCount },
    { count: bannersCount },
    { count: pendingListingsCount },
    { count: newComplaintsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("banners").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const stats = [
    { label: "На модерации", value: pendingListingsCount ?? 0, href: "/admin/listings" },
    { label: "Новых жалоб", value: newComplaintsCount ?? 0, href: "/admin/complaints" },
    { label: "Пользователей", value: usersCount ?? 0, href: null },
    { label: "Категорий", value: categoriesCount ?? 0, href: "/admin/categories" },
    { label: "Баннеров", value: bannersCount ?? 0, href: "/admin/banners" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Общая статистика. Объявления и доход появятся здесь после соответствующих модулей.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((stat) => {
          const content = (
            <div className="rounded-lg border border-border p-4">
              <div className="text-2xl font-semibold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
