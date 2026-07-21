import "./loadEnv.mjs";
import { createClient } from "@supabase/supabase-js";
import { SETTINGS } from "./config.mjs";
import { logger } from "./logger.mjs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Не найдены NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY в apps/web/.env.local"
  );
}

// Полные права, обходит RLS — используется для создания демо-пользователей,
// вставки объявлений/фото. Триггер enforce_listing_status всё равно переводит
// новые объявления в статус draft для не-staff контекста (у service_role нет
// auth.uid()) — поэтому статус на "active" переключает отдельный seed-bot.
export const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// seed-bot — служебный аккаунт с ролью moderator: реальная сессия нужна,
// чтобы RLS и триггер видели auth.uid() и has_role() = true при переводе
// объявлений в статус "active" (только staff может это делать).
const SEED_BOT_PASSWORD = "Seed-Bot-" + SERVICE_ROLE_KEY.slice(-12);

export async function ensureSeedBot() {
  const email = SETTINGS.seedBotEmail;

  const { data: existing } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("full_name", "__seed_bot__")
    .maybeSingle();

  let userId = existing?.id;

  if (!userId) {
    const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password: SEED_BOT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "__seed_bot__" },
    });
    if (createError) throw new Error(`Не удалось создать seed-bot: ${createError.message}`);
    userId = created.user.id;
    logger.info(`seed-bot создан (${userId})`);
  } else {
    // На случай смены SUPABASE_SERVICE_ROLE_KEY (и, значит, пароля) между запусками.
    await serviceClient.auth.admin.updateUserById(userId, { password: SEED_BOT_PASSWORD });
  }

  await serviceClient.from("profiles").update({ is_demo: true }).eq("id", userId);

  const { data: moderatorRole } = await serviceClient
    .from("roles")
    .select("id")
    .eq("code", "moderator")
    .single();

  const { data: existingRole } = await serviceClient
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role_id", moderatorRole.id)
    .maybeSingle();

  if (!existingRole) {
    await serviceClient.from("user_roles").insert({ user_id: userId, role_id: moderatorRole.id });
  }

  const seedBotClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInError } = await seedBotClient.auth.signInWithPassword({
    email,
    password: SEED_BOT_PASSWORD,
  });
  if (signInError) throw new Error(`Не удалось войти как seed-bot: ${signInError.message}`);

  return { seedBotClient, seedBotId: userId };
}
