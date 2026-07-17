import Link from "next/link";

export function Pagination({
  basePath,
  searchParams,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-3 text-sm">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">
          ← Назад
        </Link>
      )}
      <span className="text-muted-foreground">
        Страница {page} из {totalPages}
      </span>
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className="rounded-md border border-border px-3 py-1.5 hover:bg-muted">
          Вперёд →
        </Link>
      )}
    </div>
  );
}
