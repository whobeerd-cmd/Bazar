import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessForm } from "../../(dashboard)/my-business/BusinessForm";
import { getBusinessCategories } from "@/lib/business/queries";

export default async function NewMasterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/masters/new");

  const [categories, { data: cities }] = await Promise.all([
    getBusinessCategories(supabase, "master"),
    supabase.from("cities").select("id, name").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Разместить анкету мастера</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Расскажите, чем занимаетесь — анкета появится в разделе «Мастера» сразу. Фото добавите на следующем шаге.
      </p>
      <div className="card mt-6 p-6">
        <BusinessForm mode="create" type="master" categories={categories} cities={cities ?? []} />
      </div>
    </div>
  );
}
