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
    { label: "Пользователей", value: usersCount ?? 0, href: "/admin/users" },
    { label: "Категорий", value: categoriesCount ?? 0, href: "/admin/categories" },
    { label: "Баннеров", value: bannersCount ?? 0, href: "/admin/banners" },
  ];

  const sections = [
    {
      title: "Объявления",
      href: "/admin/listings",
      description: "Проверка новых объявлений перед публикацией, а также архивация или отметка VIP уже опубликованных.",
    },
    {
      title: "Жалобы",
      href: "/admin/complaints",
      description: "Жалобы пользователей на объявления — рассмотреть или отклонить.",
    },
    {
      title: "Пользователи",
      href: "/admin/users",
      description: "Назначить модератора/администратора или заблокировать нарушителя — без SQL.",
    },
    {
      title: "Категории",
      href: "/admin/categories",
      description: "Разделы и подразделы каталога — добавить, переименовать, скрыть, изменить порядок.",
    },
    {
      title: "Баннеры",
      href: "/admin/banners",
      description: "Собственная реклама на главной странице — без сторонних рекламных сетей.",
    },
    {
      title: "Настройки сайта",
      href: "/admin/settings",
      description: "Название, логотип, описание для поисковиков, контактные телефон и email.",
    },
    {
      title: "Журнал действий",
      href: "/admin/audit-log",
      description: "Кто из администраторов/модераторов что менял — для порядка и разбора спорных случаев.",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Дашборд</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Общая статистика. Доход появится здесь, когда будет реальная монетизация.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="card p-4 transition hover:border-border-strong hover:shadow-card-hover">
              <div className="text-2xl font-extrabold text-foreground">{stat.value}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold tracking-tight text-foreground">Разделы админки</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="card p-4 transition hover:border-border-strong hover:shadow-card-hover"
          >
            <p className="font-semibold text-foreground">{section.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
