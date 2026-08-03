import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/admin";
import { BusinessForm } from "@/app/(dashboard)/my-business/BusinessForm";
import { BusinessImageUploader } from "@/app/(dashboard)/my-business/BusinessImageUploader";
import { adminUpdateBusinessAction } from "@/lib/actions/admin/business";
import { getBusinessCategories } from "@/lib/business/queries";
import type { BusinessHours } from "@/lib/business/hours";

export default async function AdminEditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireStaff();

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, type, name, category_id, city_id, description, address_text, phone, whatsapp, instagram, website, hours, status, slug, specializations, price_from, experience_years, house_call"
    )
    .eq("id", id)
    .single();

  if (!business) notFound();

  const isMaster = business.type === "master";

  const [{ data: images }, categories, { data: cities }] = await Promise.all([
    supabase.from("business_images").select("id, url").eq("business_id", id).order("sort_order"),
    getBusinessCategories(supabase),
    supabase.from("cities").select("id, name").order("name"),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {isMaster ? "Редактирование анкеты мастера (админ)" : "Редактирование бизнеса (админ)"}
        </h1>
        <a
          href={`/${isMaster ? "masters" : "business"}/${business.slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Смотреть страницу →
        </a>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Правки видны сразу владельцу и посетителям — используйте, если в фото или тексте недопустимое содержимое.
      </p>

      <div className="card mt-6 max-w-xl p-6">
        <p className="mb-3 text-sm font-semibold text-foreground">{isMaster ? "Фото / портфолио" : "Фото"}</p>
        <BusinessImageUploader userId={user.id} businessId={id} initialImages={images ?? []} />

        <div className="mt-6 border-t border-border pt-6">
          <BusinessForm
            mode="edit"
            type={business.type as "business" | "master"}
            action={adminUpdateBusinessAction}
            categories={categories}
            cities={cities ?? []}
            defaultValues={{
              id: business.id,
              name: business.name,
              categoryId: business.category_id,
              cityId: business.city_id,
              description: business.description,
              addressText: business.address_text,
              phone: business.phone,
              whatsapp: business.whatsapp,
              instagram: business.instagram,
              website: business.website,
              hours: (business.hours as BusinessHours) ?? {},
              specializations: business.specializations ?? [],
              priceFrom: business.price_from,
              experienceYears: business.experience_years,
              houseCall: business.house_call,
            }}
          />
        </div>
      </div>
    </div>
  );
}
