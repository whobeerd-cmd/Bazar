"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { CategoryNode } from "@/lib/categories";

export function CategoryMegaMenu({ tree }: { tree: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(tree[0]?.id ?? null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = tree.find((c) => c.id === activeId) ?? tree[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
          open
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-background text-foreground hover:border-border-strong hover:bg-muted"
        }`}
      >
        <LayoutGrid className="h-4 w-4" strokeWidth={2} />
        Категории
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-[min(90vw,760px)] overflow-hidden rounded-2xl border border-border bg-background shadow-card-hover">
          {/* Desktop: two-pane preview */}
          <div className="hidden md:grid md:grid-cols-[240px_1fr]">
            <ul className="max-h-[26rem] overflow-y-auto border-r border-border py-2">
              {tree.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    onMouseEnter={() => setActiveId(category.id)}
                    className={`flex items-center gap-2.5 px-4 py-2 text-sm transition ${
                      category.id === active?.id
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <CategoryIcon slug={category.slug} className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{category.name}</span>
                    {category.children.length > 0 && (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="max-h-[26rem] overflow-y-auto p-5">
              {active && (
                <>
                  <Link
                    href={`/category/${active.slug}`}
                    className="text-sm font-bold text-foreground hover:text-primary hover:underline"
                  >
                    Все объявления: {active.name}
                  </Link>
                  {active.children.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                      {active.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className="truncate rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">Подразделов пока нет.</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile: flat list */}
          <ul className="max-h-[70vh] overflow-y-auto py-2 md:hidden">
            {tree.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                >
                  <CategoryIcon slug={category.slug} className="h-4 w-4 shrink-0" />
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
