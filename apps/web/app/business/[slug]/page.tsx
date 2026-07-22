import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, MapPin, Phone, MessageCircle, AtSign, Globe, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/media/Gallery";
import { StarRating } from "@/components/business/StarRating";
import { getOpenStatus, DAY_KEYS, DAY_LABELS, type BusinessHours } from "@/lib/business/hours";
import { ReviewForm } from "./ReviewForm";
import { OwnerReplyForm } from "./OwnerReplyForm";
import { ShareButton } from "./ShareButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name, description, status, cities(name)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!business) return {};

  const city = Array.isArray(business.cities) ? business.cities[0] : business.cities;
  const title = business.name;
  const description = city?.name
    ? `${city.name} · ${business.description.slice(0, 150) || business.name}`
    : business.description.slice(0, 150) || business.name;

  return { title, description, openGraph: { title, description } };
}

function reviewsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} отзыв`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${count} отзыва`;
  return `${count} отзывов`;
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, description, address_text, lat, lng, phone, whatsapp, instagram, website, hours, status, is_verified, owner_id, rating_avg, rating_count, views_count, business_categories(name, slug), cities(name, lat, lng)"
    )
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const [{ data: images }, { data: reviews }] = await Promise.all([
    supabase.from("business_images").select("id, url").eq("business_id", business.id).order("sort_order"),
    supabase
      .from("business_reviews")
      .select("id, rating, body, owner_reply, owner_replied_at, created_at, user_id, profiles(full_name)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
  ]);

  // Счётчик просмотров — best-effort, не блокирует рендер страницы.
  supabase
    .from("businesses")
    .update({ views_count: business.views_count + 1 })
    .eq("id", business.id)
    .then(() => {});

  const category = Array.isArray(business.business_categories) ? business.business_categories[0] : business.business_categories;
  const city = Array.isArray(business.cities) ? business.cities[0] : business.cities;
  const isOwner = user?.id === business.owner_id;
  const openStatus = getOpenStatus(business.hours as BusinessHours);
  const myReview = reviews?.find((r) => r.user_id === user?.id);

  const contactRow = (
    <div className="card p-5">
      <div className="space-y-2.5 text-sm">
        {city?.name && (
          <p className="flex items-start gap-2 text-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>
              {city.name}
              {business.address_text ? `, ${business.address_text}` : ""}
            </span>
          </p>
        )}
        {openStatus && (
          <p className={`flex items-center gap-2 ${openStatus.isOpen ? "text-emerald-700" : "text-muted-foreground"}`}>
            <Clock className="h-4 w-4 shrink-0" />
            {openStatus.label}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {business.phone && (
          <a href={`tel:${business.phone}`} className="btn-primary flex items-center justify-center gap-2 py-2.5">
            <Phone className="h-4 w-4" />
            {business.phone}
          </a>
        )}
        <div className="flex gap-2">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {business.instagram && (
            <a
              href={`https://instagram.com/${business.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <AtSign className="h-4 w-4" />
              Instagram
            </a>
          )}
        </div>
        {business.website && (
          <a
            href={business.website}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <Globe className="h-4 w-4" />
            Сайт
          </a>
        )}
      </div>

      {business.hours && Object.keys(business.hours as object).length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Часы работы</p>
          <dl className="space-y-1 text-sm">
            {DAY_KEYS.map((day) => {
              const hours = (business.hours as BusinessHours)[day];
              return (
                <div key={day} className="flex justify-between">
                  <dt className="text-muted-foreground">{DAY_LABELS[day]}</dt>
                  <dd className="font-medium text-foreground">
                    {!hours || hours.closed ? "Выходной" : `${hours.open}–${hours.close}`}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-4">
        <ShareButton title={business.name} />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      {business.status !== "active" && (
        <p className="mb-5 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Этот бизнес сейчас скрыт (статус: {business.status}) — вам видно, потому что вы владелец или модератор.
        </p>
      )}

      {category?.slug && (
        <Link
          href={`/business/category/${category.slug}`}
          className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          ← {category.name}
        </Link>
      )}

      <div className="mt-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="lg:col-span-2">
          <Gallery images={images ?? []} title={business.name} />

          <div className="mt-5">
            <div className="flex items-center gap-2">
              <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
                {business.name}
              </h1>
              {business.is_verified && <BadgeCheck className="h-6 w-6 shrink-0 text-primary" />}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={business.rating_avg} />
              <span className="text-sm text-muted-foreground">
                {business.rating_count > 0 ? `${Number(business.rating_avg).toFixed(1)} · ${reviewsLabel(business.rating_count)}` : "Пока нет отзывов"}
              </span>
            </div>
          </div>

          <div className="mt-5 lg:hidden">{contactRow}</div>

          <div className="card mt-6 p-5 sm:p-6">
            <p className="text-sm font-semibold text-foreground">Описание</p>
            <div className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
              {business.description}
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
                        <p className="text-xs font-semibold text-foreground">Ответ владельца</p>
                        <p className="mt-1 text-sm text-foreground">{review.owner_reply}</p>
                      </div>
                    )}

                    {isOwner && !review.owner_reply && (
                      <div className="mt-2">
                        <OwnerReplyForm reviewId={review.id} businessId={business.id} slug={slug} />
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
              businessId={business.id}
              slug={slug}
              initialRating={myReview?.rating}
              initialBody={myReview?.body ?? undefined}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Владелец не может оставить отзыв на свой же бизнес.</p>
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
