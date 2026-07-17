import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
      <aside className="w-48 shrink-0">
        <nav className="space-y-1 text-sm">
          <Link href="/profile" className="block rounded-md px-3 py-2 hover:bg-muted">
            Профиль
          </Link>
          <Link href="/my-ads" className="block rounded-md px-3 py-2 hover:bg-muted">
            Мои объявления
          </Link>
          <Link href="/favorites" className="block rounded-md px-3 py-2 hover:bg-muted">
            Избранное
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="mt-2 block w-full rounded-md px-3 py-2 text-left text-red-600 hover:bg-red-50"
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
