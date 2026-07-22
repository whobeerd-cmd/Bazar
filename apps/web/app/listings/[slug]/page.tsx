import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, MapPin, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDealType, formatPrice } from "@/lib/format";
import { ListingsMap } from "@/components/map/ListingsMap";
import { Gallery } from "@/components/media/Gallery";
import { ReportButton } from "./ReportButton";
import { PhoneReveal } from "./PhoneReveal";
import { FavoriteButton } from "./FavoriteButton";
import { CommentForm } from "./CommentForm";
import { DeleteCommentButton } from "./DeleteCommentButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, description, price, price_type, status, cities(name)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!listing) return {};

  const { data: image } = await supabase
    .from("listing_images")
    .select("url")
    .eq("listing_id", listing.id)
    .order("sort_order")
    .limit(1)
    .maybeSingle();

  const city = Array.isArray(listing.cities) ? listing.cities[0] : listing.cities;
  const title = `${listing.title} — ${formatPrice(listing.price_type, listing.price)}`;
  const description = city?.name
    ? `${city.name} · ${listing.description.slice(0, 150) || listing.title}`
    : listing.description.slice(0, 150) || listing.title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image?.url ? [image.url] : undefined,
    },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      "id, title, description, price, price_type, condition, deal_type, address_text, lat, lng, status, is_vip, created_at, user_id, categories(name, slug), cities(name, lat, lng), profiles!listings_user_id_fkey(full_name, avatar_url, phone)"
    )
    .eq("slug", slug)
    .single();

  if (!listing) notFound();

  const [{ data: images }, { data: videos }, { data: attrRows }, { data: comments }, favoriteRow] =
    await Promise.all([
      supabase.from("listing_images").select("id, url").eq("listing_id", listing.id).order("sort_order"),
      supabase.from("listing_videos").select("id, url").eq("listing_id", listing.id).order("sort_order"),
      supabase
        .from("listing_attributes")
        .select("value, category_attributes(name, type)")
        .eq("listing_id", listing.id),
      supabase
        .from("listing_comments")
        .select("id, body, created_at, user_id, profiles(full_name)")
        .eq("listing_id", listing.id)
        .order("created_at"),
      user
        ? supabase
            .from("favorites")
            .select("user_id")
            .eq("user_id", user.id)
            .eq("listing_id", listing.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
  const city = Array.isArray(listing.cities) ? listing.cities[0] : listing.cities;
  const seller = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
  const isFavorited = Boolean(favoriteRow?.data);

  const mapLat = listing.lat ?? city?.lat;
  const mapLng = listing.lng ?? city?.lng;
  const mapsConfigured = Boolean(process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY);

  const postedLabel = new Date(listing.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const sellerCard = (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        {seller?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={seller.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {(seller?.full_name || "П").charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{seller?.full_name || "Продавец"}</p>
          <p className="text-xs text-muted-foreground">Автор объявления</p>
        </div>
      </div>

      <div className="mt-4">
        <PhoneReveal phone={seller?.phone ?? null} />
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        {user && <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} />}
        {user?.id !== listing.user_id && (
          <div className="flex-1">
            <ReportButton listingId={listing.id} isAuthenticated={Boolean(user)} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      {listing.status !== "active" && (
        <p className="mb-5 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Это объявление сейчас не опубликовано (статус: {listing.status}) — вам видно, потому что вы автор или модератор.
        </p>
      )}

      {category?.slug && (
        <Link
          href={`/category/${category.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {category.name}
        </Link>
      )}

      <div className="mt-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="lg:col-span-2">
          <Gallery images={images ?? []} title={listing.title} isVip={listing.is_vip} />

          <div className="mt-5">
            {(formatDealType(listing.deal_type) || listing.condition) && (
              <div className="flex flex-wrap items-center gap-2">
                {formatDealType(listing.deal_type) && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                    {formatDealType(listing.deal_type)}
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    listing.condition === "new"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {listing.condition === "new" ? "Новое" : "Б/у"}
                </span>
              </div>
            )}

            <h1 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
              {listing.title}
            </h1>
            <p className="mt-1.5 text-[28px] font-extrabold text-foreground sm:text-3xl">
              {formatPrice(listing.price_type, listing.price)}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {city?.name && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {city.name}
                  {listing.address_text ? `, ${listing.address_text}` : ""}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Опубликовано {postedLabel}
              </span>
            </div>
          </div>

          <div className="mt-5 lg:hidden">{sellerCard}</div>

          <div className="card mt-6 p-5 sm:p-6">
            <p className="text-sm font-semibold text-foreground">Описание</p>
            <div className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
              {listing.description}
            </div>
          </div>

          {videos && videos.length > 0 && (
            <div className="card mt-6 space-y-1.5 p-5 sm:p-6">
              <p className="text-sm font-semibold text-foreground">Видео</p>
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm font-medium text-primary hover:underline"
                >
                  {video.url}
                </a>
              ))}
            </div>
          )}

          {attrRows && attrRows.length > 0 && (
            <div className="card mt-6 p-5 sm:p-6">
              <p className="mb-3 text-sm font-semibold text-foreground">Характеристики</p>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {attrRows.map((row, i) => {
                  const attr = Array.isArray(row.category_attributes)
                    ? row.category_attributes[0]
                    : row.category_attributes;
                  const value = (row.value as { value: unknown })?.value;
                  return (
                    <div key={i} className="contents">
                      <dt className="text-muted-foreground">{attr?.name}</dt>
                      <dd className="font-medium text-foreground">
                        {attr?.type === "bool" ? (value ? "Да" : "Нет") : String(value)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {mapsConfigured && mapLat != null && mapLng != null && (
            <div className="card mt-6 p-5 sm:p-6">
              <p className="mb-3 text-sm font-semibold text-foreground">Местоположение</p>
              <ListingsMap
                points={[{ id: listing.id, lat: Number(mapLat), lng: Number(mapLng), title: listing.title }]}
                center={[Number(mapLat), Number(mapLng)]}
                zoom={listing.lat != null ? 15 : 12}
                height={280}
              />
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-20">{sellerCard}</div>
        </div>
      </div>

      <div className="card mt-8 p-5 sm:p-6">
        <p className="mb-4 text-sm font-semibold text-foreground">
          Комментарии{comments && comments.length > 0 ? ` (${comments.length})` : ""}
        </p>

        {comments && comments.length > 0 && (
          <div className="mb-5 space-y-4">
            {comments.map((comment) => {
              const author = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
              const canDelete =
                user?.id === comment.user_id || (user && user.id === listing.user_id);
              return (
                <div key={comment.id} className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(author?.full_name || "П").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{author?.full_name || "Пользователь"}</p>
                      {canDelete && <DeleteCommentButton commentId={comment.id} slug={slug} />}
                    </div>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {user ? (
          <CommentForm listingId={listing.id} slug={slug} />
        ) : (
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="font-medium text-primary hover:underline">
              Войдите
            </a>
            , чтобы оставить комментарий.
          </p>
        )}
      </div>
    </div>
  );
}
