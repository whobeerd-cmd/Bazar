import Link from "next/link";
import { BadgeCheck, Building2 } from "lucide-react";
import { StarRating } from "./StarRating";
import type { BusinessCard } from "@/lib/business/queries";

export function BusinessCardView({ business }: { business: BusinessCard }) {
  return (
    <Link
      href={`/business/${business.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-background shadow-card transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {business.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            <Building2 className="h-8 w-8" strokeWidth={1.4} />
          </div>
        )}
        {business.is_featured && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground shadow-sm">
            Рекомендуем
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-semibold text-foreground">{business.name}</p>
          {business.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
        </div>
        {business.category_name && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{business.category_name}</p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5">
          <StarRating value={business.rating_avg} size={13} />
          <span className="text-xs text-muted-foreground">
            {business.rating_count > 0 ? `${business.rating_avg.toFixed(1)} (${business.rating_count})` : "Нет отзывов"}
          </span>
        </div>
        {business.city_name && <p className="mt-1 truncate text-xs text-muted-foreground">{business.city_name}</p>}
      </div>
    </Link>
  );
}
