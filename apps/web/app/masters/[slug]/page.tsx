import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, MapPin, Phone, MessageCircle, AtSign, Globe, Navigation, Briefcase, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildWhatsAppLink } from "@/lib/format";
import { Gallery } from "@/components/media/Gallery";
import { StarRating } from "@/components/business/StarRating";
import { ReviewForm } from "../../business/[slug]/ReviewForm";
import { OwnerReplyForm } from "../../business/[slug]/OwnerReplyForm";
import { ShareButton } from "@/components/ShareButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: master } = await supabase
    .from("businesses")
    .select("id, name, description, status, cover_image_url, cities(name)")
    .eq("slug", slug)
    .eq("type", "master")
    .eq("status", "active")
    .single();

  if (!master) return {};

  const city = Array.isArray(master.cities) ? master.cities[0] : master.cities;
  const title = master.name;
  const description = city?.name
    ? `${city.name} · ${master.description.slice(0, 150) || master.name}`
    : master.description.slice(0, 150) || master.name;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: master.cover_image_url ? [master.cover_image_url] : undefined,
    },
  };
}

function reviewsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} отзыв`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} отзыва`;
  return `${count} отзывов`;
}

export default async function MasterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: master } = await supabase
    .from("businesses")
    .select(
      "id, name, description, address_text, lat, lng, phone, whatsapp, instagram, website, status, is_verified, owner_id, rating_avg, rating_count, views_count, specializations, price_from, experience_years, house_call, business_categories(name, slug), cities(name, lat, lng)"
    )
    .eq("slug", slug)
    .eq("type", "master")
    .single();

  if (!master) notFound();

  const [{ data: images }, { data: reviews }] = await Promise.all([
    supabase.from("business_images").select("id, url").eq("business_id", master.id).order("sort_order"),
    supabase
      .from("business_reviews")
      .select("id, rating, body, owner_reply, owner_replied_at, created_at, user_id, profiles(full_name)")
      .eq("business_id", master.id)
      .order("created_at", { ascending: false }),
  ]);

  supabase
    .from("businesses")
    .update({ views_count: master.views_count + 1 })
    .eq("id", master.id)
    .then(() => {});

  const category = Array.isArray(master.business_categories) ? master.business_categories[0] : master.business_categories;
  const city = Array.isArray(master.cities) ? master.cities[0] : master.cities;
  const isOwner = user?.id === master.owner_id;
  const myReview = reviews?.find((r) => r.user_id === user?.id);

  const contactRow = (
    <div className="card p-5">
      <div className="space-y-2.5 text-sm">
        {(master.price_from != null || master.experience_years != null || master.house_call) && (
          <div className="flex flex-wrap gap-1.5">
            {master.price_from != null && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                от {master.price_from.toLocaleString("ru-RU")} ₽
              </span>
            )}
            {master.experience_years != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                <Briefcase className="h-3 w-3" />
                Опыт {master.experience_years} {master.experience_years === 1 ? "год" : "лет"}
              </span>
            )}
            {master.house_call && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                <Car className="h-3 w-3" />
                Выезд к клиенту
              </span>
            )}
          </div>
        )}
        {city?.name && (
          <div className="space-y-2">
            {(master.address_text || (master.lat != null && master.lng != null)) && (
              <a
                href={
                  master.lat != null && master.lng != null
                    ? `https://www.google.com/maps/dir/?api=1&destination=${master.lat},${master.lng}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${city.name}${master.address_text ? `, ${master.address_text}` : ""}`
                      )}`
                }
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex items-center justify-center gap-2 py-2.5"
              >
                <Navigation className="h-4 w-4" />
                Проложить маршрут
              </a>
            )}
            <p className="flex items-start gap-2 text-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {city.name}
                {master.address_text ? `, ${master.address_text}` : ""}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {master.phone && (
          <a href={`tel:${master.phone}`} className="btn-primary flex items-center justify-center gap-2 py-2.5">
            <Phone className="h-4 w-4" />
            {master.phone}
          </a>
        )}
        <div className="flex gap-2">
          {master.whatsapp && (
            <a
              href={buildWhatsAppLink(master.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {master.instagram && (
            <a
              href={`https://instagram.com/${master.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <AtSign className="h-4 w-4" />
              Instagram
            </a>
          )}
        </div>
        {master.website && (
          <a
            href={master.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <Globe className="h-4 w-4" />
            Сайт
          </a>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <ShareButton title={master.name} />
      </div>
    </div>
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const masterJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: master.name,
    description: master.description,
    url: `${siteUrl}/masters/${slug}`,
    image: (images ?? []).map((img) => img.url),
    ...(master.phone ? { telephone: master.phone } : {}),
    ...(city?.name ? { address: { "@type": "PostalAddress", addressLocality: city.name } } : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(masterJsonLd) }} />
      {master.status !== "active" && (
        <p className="mb-5 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Эта анкета сейчас скрыта — вам видно, потому что вы владелец или модератор.
        </p>
      )}

      <Link href="/masters" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
        ← Мастера{category?.name ? ` · ${category.name}` : ""}
      </Link>

      <div className="mt-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="lg:col-span-2">
          <Gallery images={images ?? []} title={master.name} />

          <div className="mt-5">
            <div className="flex items-center gap-2">
              <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
                {master.name}
              </h1>
              {master.is_verified && <BadgeCheck className="h-6 w-6 shrink-0 text-primary" />}
            </div>
            {master.specializations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {master.specializations.map((s: string) => (
                  <span key={s} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={master.rating_avg} />
              <span className="text-sm text-muted-foreground">
                {master.rating_count > 0 ? `${Number(master.rating_avg).toFixed(1)} · ${reviewsLabel(master.rating_count)}` : "Пока нет отзывов"}
              </span>
            </div>
          </div>

          <div className="mt-5 lg:hidden">{contactRow}</div>

          <div className="card mt-6 p-5 sm:p-6">
            <p className="text-sm font-semibold text-foreground">О мастере</p>
            <div className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
              {master.description}
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-20">{contactRow}</div>
        </div>
      </div>

      <div className="card mt-8 p-5 sm:p-6">
        <p className="mb-4 text-sm font-semibold text-foreground">
          Отзывы{reviews && reviews.length > 0 ? ` (${reviews.length})` : ""}
        </p>

        {reviews && reviews.length > 0 && (
          <div className="mb-6 space-y-5">
            {reviews.map((review) => {
              const author = Array.isArray(review.profiles) ? review.profiles[0] : review.profiles;
              return (
                <div key={review.id} className="flex gap-3 border-b border-border pb-5 last:border-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(author?.full_name || "П").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">{author?.full_name || "Пользователь"}</p>
                      <StarRating value={review.rating} size={12} />
                    </div>
                    {review.body && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{review.body}</p>}

                    {review.owner_reply && (
                      <div className="mt-2 rounded-lg bg-muted/60 p-3">
                        <p className="text-xs font-semibold text-foreground">Ответ мастера</p>
                        <p className="mt-1 text-sm text-foreground">{review.owner_reply}</p>
                      </div>
                    )}

                    {isOwner && !review.owner_reply && (
                      <div className="mt-2">
                        <OwnerReplyForm reviewId={review.id} businessId={master.id} slug={slug} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {user ? (
          !isOwner ? (
            <ReviewForm
              businessId={master.id}
              slug={slug}
              initialRating={myReview?.rating}
              initialBody={myReview?.body ?? undefined}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Нельзя оставить отзыв на свою же анкету.</p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="font-medium text-primary hover:underline">
              Войдите
            </a>
            , чтобы оставить отзыв.
          </p>
        )}
      </div>
    </div>
  );
}
