import { z } from "zod";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const businessSchema = z.object({
  type: z.enum(["business", "master"]).default("business"),
  name: z.string().trim().min(2, "Название должно быть не короче 2 символов").max(100),
  categoryId: z.coerce.number().int().positive("Выберите раздел"),
  cityId: z.coerce.number().int().positive("Выберите населённый пункт"),
  description: z.string().trim().min(20, "Описание должно быть не короче 20 символов"),
  addressText: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  website: z.string().trim().optional(),
  specializations: z.string().trim().optional(),
  priceFrom: z.union([z.coerce.number().nonnegative(), z.literal("")]).optional(),
  experienceYears: z.union([z.coerce.number().int().nonnegative(), z.literal("")]).optional(),
  houseCall: z.coerce.boolean().optional(),
});

function parseHours(formData: FormData) {
  const hours: Record<string, { open: string; close: string; closed: boolean }> = {};
  for (const day of DAYS) {
    const closed = formData.get(`hours_${day}_closed`) === "on";
    hours[day] = {
      open: String(formData.get(`hours_${day}_open`) ?? "09:00"),
      close: String(formData.get(`hours_${day}_close`) ?? "18:00"),
      closed,
    };
  }
  return hours;
}

export function parsedBusinessPayload(parsed: z.infer<typeof businessSchema>, formData: FormData) {
  const specializations = (parsed.specializations ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    type: parsed.type,
    name: parsed.name,
    category_id: parsed.categoryId,
    city_id: parsed.cityId,
    description: parsed.description,
    address_text: parsed.addressText || null,
    phone: parsed.phone || null,
    whatsapp: parsed.whatsapp || null,
    instagram: parsed.instagram || null,
    website: parsed.website || null,
    hours: parseHours(formData),
    specializations,
    price_from: parsed.priceFrom !== undefined && parsed.priceFrom !== "" ? Number(parsed.priceFrom) : null,
    experience_years:
      parsed.experienceYears !== undefined && parsed.experienceYears !== "" ? Number(parsed.experienceYears) : null,
    house_call: Boolean(parsed.houseCall),
  };
}
