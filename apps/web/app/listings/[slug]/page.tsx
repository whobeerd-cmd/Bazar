import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { ListingsMap } from "@/components/map/ListingsMap";
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
      "id, title, description, price, price_type, condition, address_text, lat, lng, status, created_at, user_id, categories(name), cities(name, lat, lng), profiles(full_name, avatar_url, phone)"
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {listing.status !== "active" && (
        <p className="mb-5 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Это объявление сейчас не опубликовано (статус: {listing.status}) — вам видно, потому что вы автор или модератор.
        </p>
      )}

      <p className="text-sm font-medium text-muted-foreground">
        {category?.name}
        {city?.name ? ` · ${city.name}` : ""}
      </p>
      <h1 className="mt-1 text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
        {listing.title}
      </h1>
      <p className="mt-2 text-2xl font-extrabold text-foreground">
        {formatPrice(listing.price_type, listing.price)}
      </p>

      {images && images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((image, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={image.url}
              alt=""
              className={`aspect-square w-full rounded-xl border border-border object-cover ${
                i === 0 && images.length > 1 ? "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2" : ""
              }`}
            />
          ))}
        </div>
      )}

      {videos && videos.length > 0 && (
        <div className="mt-5 space-y-1.5">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-medium text-primary hover:underline"
            >
              Видео: {video.url}
            </a>
          ))}
        </div>
      )}

      <div className="mt-7 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
        {listing.description}
      </div>

      {attrRows && attrRows.length > 0 && (
        <div className="mt-7 rounded-xl border border-border bg-background p-5 shadow-card">
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

      <p className="mt-6 text-sm text-muted-foreground">
        Состояние: {listing.condition === "new" ? "новое" : "б/у"}
        {listing.address_text ? ` · ${listing.address_text}` : ""}
      </p>

      {mapLat != null && mapLng != null && (
        <div className="mt-6">
          <ListingsMap
            points={[{ id: listing.id, lat: Number(mapLat), lng: Number(mapLng), title: listing.title }]}
            center={[Number(mapLat), Number(mapLng)]}
            zoom={listing.lat != null ? 15 : 12}
            height={280}
          />
        </div>
      )}

      <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-background p-4 shadow-card">
        <div className="flex items-center gap-3">
          {seller?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={seller.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(seller?.full_name || "П").charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">{seller?.full_name || "Продавец"}</p>
            <PhoneReveal phone={seller?.phone ?? null} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} />}
          {user?.id !== listing.user_id && (
            <ReportButton listingId={listing.id} isAuthenticated={Boolean(user)} />
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-background p-5 shadow-card">
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
                <div key={comment.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">{author?.full_name || "Пользователь"}</p>
                    {canDelete && <DeleteCommentButton commentId={comment.id} slug={slug} />}
                  </div>
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
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
