import Link from "next/link";
import { ImageOff } from "lucide-react";
import { formatDealType, formatPrice } from "@/lib/format";
import type { ListingCard } from "@/lib/listings/query";

export function ListingCardView({ listing }: { listing: ListingCard }) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-background shadow-card transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {listing.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
            <ImageOff className="h-7 w-7" strokeWidth={1.4} />
          </div>
        )}
        {listing.is_vip && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground shadow-sm">
            VIP
          </span>
        )}
        {formatDealType(listing.deal_type) && (
          <span className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm">
            {formatDealType(listing.deal_type)}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-foreground">{listing.title}</p>
        <p className="mt-0.5 text-[15px] font-bold text-foreground">
          {formatPrice(listing.price_type, listing.price)}
        </p>
        {listing.city_name && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{listing.city_name}</p>
        )}
      </div>
    </Link>
  );
}
