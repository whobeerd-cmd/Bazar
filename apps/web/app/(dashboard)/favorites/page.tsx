import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingCardView } from "@/components/listings/ListingCardView";
import type { ListingCard } from "@/lib/listings/query";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/favorites");

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      "created_at, listings(id, title, slug, price, price_type, cover_image_url, is_vip, cities(name))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items: ListingCard[] = (favorites ?? [])
    .map((row) => {
      const listing = Array.isArray(row.listings) ? row.listings[0] : row.listings;
      if (!listing) return null;
      const city = Array.isArray(listing.cities) ? listing.cities[0] : listing.cities;
      return {
        id: listing.id,
        title: listing.title,
        slug: listing.slug,
        price: listing.price,
        price_type: listing.price_type,
        cover_image_url: listing.cover_image_url,
        is_vip: listing.is_vip,
        created_at: row.created_at,
        city_name: city?.name ?? null,
      };
    })
    .filter((item): item is ListingCard => item !== null);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Избранное</h1>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Пока пусто — добавляйте объявления в избранное кнопкой на странице объявления.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((listing) => (
            <ListingCardView key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
