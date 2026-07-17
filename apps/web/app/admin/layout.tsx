import Link from "next/link";
import { requireStaff } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // requireStaff (не requireAdmin) — модераторы должны видеть модерацию
  // объявлений и жалобы, не будучи полными администраторами.
  await requireStaff();

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Админ-панель
        </p>
        <nav className="space-y-1 text-sm">
          <Link href="/admin/dashboard" className="block rounded-md px-3 py-2 hover:bg-muted">
            Дашборд
          </Link>
          <Link href="/admin/listings" className="block rounded-md px-3 py-2 hover:bg-muted">
            Модерация объявлений
          </Link>
          <Link href="/admin/complaints" className="block rounded-md px-3 py-2 hover:bg-muted">
            Жалобы
          </Link>
          <Link href="/admin/categories" className="block rounded-md px-3 py-2 hover:bg-muted">
            Категории
          </Link>
          <Link href="/admin/banners" className="block rounded-md px-3 py-2 hover:bg-muted">
            Баннеры
          </Link>
          <Link href="/admin/settings" className="block rounded-md px-3 py-2 hover:bg-muted">
            Настройки сайта
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
