import { requireStaff } from "@/lib/auth/admin";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // requireStaff (не requireAdmin) — модераторы должны видеть модерацию
  // объявлений и жалобы, не будучи полными администраторами.
  await requireStaff();

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-52 shrink-0">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Админ-панель
        </p>
        <AdminNav />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
