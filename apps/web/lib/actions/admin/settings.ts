"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, logAdminAction } from "@/lib/auth/admin";
import type { AuthActionState } from "@/lib/actions/auth";

const settingsSchema = z.object({
  siteName: z.string().trim().min(2, "Название должно быть не короче 2 символов"),
  siteDescription: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  contactEmail: z.string().trim().optional(),
});

export async function updateSiteSettingsAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteDescription: formData.get("siteDescription"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const updates = [
    { key: "site_name", value: { text: parsed.data.siteName } },
    { key: "site_description", value: { text: parsed.data.siteDescription ?? "" } },
    { key: "contact_phone", value: { text: parsed.data.contactPhone ?? "" } },
    { key: "contact_email", value: { text: parsed.data.contactEmail ?? "" } },
  ];

  for (const update of updates) {
    const { error } = await supabase.from("site_settings").upsert(update);
    if (error) return { error: "Ошибка: " + error.message };
  }

  await logAdminAction(supabase, user.id, "update", "site_settings", null, parsed.data);
  revalidatePath("/", "layout"); // название сайта показывается в шапке на каждой странице
  revalidatePath("/admin/settings");
  return { success: "Настройки сохранены" };
}

// Вызывается после загрузки нового лого в Storage на клиенте.
export async function updateLogoUrlAction(logoUrl: string) {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "logo_url", value: { url: logoUrl } });

  if (error) return { error: error.message };

  await logAdminAction(supabase, user.id, "update", "site_settings.logo_url", null, { logoUrl });
  revalidatePath("/", "layout");
  return { success: true };
}
