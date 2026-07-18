import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "../ListingForm";
import { getCityOptions } from "../categoryOptions";
import { getCategoryTree } from "@/lib/categories";

export default async function NewListingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my-ads/new");

  const [categories, cities] = await Promise.all([getCategoryTree(), getCityOptions(supabase)]);

  return (
    <div>
      <p className="text-sm font-semibold text-primary">Шаг 1 из 2</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">Новое объявление</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Заполните основные поля — на следующем шаге добавите фото и опубликуете объявление.
      </p>
      <div className="card mt-6 max-w-xl p-6">
        <ListingForm mode="create" categories={categories} cities={cities} />
      </div>
    </div>
  );
}
