"use client";

import { useEffect } from "react";
import { trackListingView } from "@/lib/recentlyViewed";
import type { ListingCard } from "@/lib/listings/query";

export function RecentlyViewedTracker({ listing }: { listing: ListingCard }) {
  useEffect(() => {
    trackListingView(listing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id]);

  return null;
}
