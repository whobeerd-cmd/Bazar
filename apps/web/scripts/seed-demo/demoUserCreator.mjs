import { MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, SURNAMES, SETTINGS } from "./config.mjs";
import { pick } from "./rng.mjs";
import { serviceClient } from "./supabaseClients.mjs";

let counter = 0;

function randomFullName() {
  const isMale = Math.random() < 0.6;
  const first = pick(isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES);
  const surnameBase = pick(SURNAMES);
  const surname = isMale ? surnameBase : surnameBase.replace(/(ов|ев|ин)$/, "$1а");
  return `${first} ${surname}`;
}

// Один демо-профиль на объявление — как отдельный "продавец", без реального
// контакта (phone остаётся пустым, PhoneReveal сам покажет "не указан").
export async function createDemoProfile() {
  counter += 1;
  const fullName = randomFullName();
  const email = `demo.${Date.now()}.${counter}@${SETTINGS.demoEmailDomain}`;

  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password: `Demo-${Math.random().toString(36).slice(2)}-${counter}`,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) throw new Error(`Не удалось создать демо-профиль: ${error.message}`);

  const userId = data.user.id;
  const { error: updateError } = await serviceClient
    .from("profiles")
    .update({ is_demo: true })
    .eq("id", userId);

  if (updateError) throw new Error(`Не удалось пометить профиль как demo: ${updateError.message}`);

  return { id: userId, fullName };
}
