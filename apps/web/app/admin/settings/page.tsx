import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import { LogoUploader } from "./LogoUploader";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["site_name", "site_description", "logo_url", "contact_phone", "contact_email"]);

  const settings = Object.fromEntries((data ?? []).map((row) => [row.key, row.value])) as Record<
    string,
    { text?: string; url?: string } | undefined
  >;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Настройки сайта</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Название сайта здесь можно поменять в любой момент — оно сразу обновится в шапке на всех
        страницах.
      </p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium">Логотип</p>
        <LogoUploader currentLogoUrl={settings.logo_url?.url ?? null} />
      </div>

      <SettingsForm
        defaults={{
          siteName: settings.site_name?.text ?? "Bazar",
          siteDescription: settings.site_description?.text ?? "",
          contactPhone: settings.contact_phone?.text ?? "",
          contactEmail: settings.contact_email?.text ?? "",
        }}
      />
    </div>
  );
}
