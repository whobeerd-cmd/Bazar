"use client";

import { useActionState } from "react";
import { createBusinessAction, updateBusinessAction } from "@/lib/actions/business";
import type { AuthActionState } from "@/lib/actions/auth";
import { DAY_KEYS, DAY_LABELS, type BusinessHours } from "@/lib/business/hours";

export type BusinessCategoryOption = { id: number; name: string; group_label: string | null };
export type CityOption = { id: number; name: string };

export function BusinessForm({
  mode,
  categories,
  cities,
  defaultValues,
}: {
  mode: "create" | "edit";
  categories: BusinessCategoryOption[];
  cities: CityOption[];
  defaultValues?: {
    id: string;
    name: string;
    categoryId: number;
    cityId: number | null;
    description: string;
    addressText: string | null;
    phone: string | null;
    whatsapp: string | null;
    instagram: string | null;
    website: string | null;
    hours: BusinessHours;
  };
}) {
  const action = mode === "create" ? createBusinessAction : updateBusinessAction;
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(action, null);

  const categoryGroups = new Map<string, BusinessCategoryOption[]>();
  for (const category of categories) {
    const label = category.group_label ?? "Другое";
    if (!categoryGroups.has(label)) categoryGroups.set(label, []);
    categoryGroups.get(label)!.push(category);
  }

  return (
    <form action={formAction} className="space-y-5">
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label htmlFor="name" className="field-label">
          Название
        </label>
        <input id="name" name="name" required defaultValue={defaultValues?.name} className="field-input" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="categoryId" className="field-label">
            Раздел
          </label>
          <select id="categoryId" name="categoryId" required defaultValue={defaultValues?.categoryId ?? ""} className="field-input">
            <option value="" disabled>
              Выберите
            </option>
            {Array.from(categoryGroups.entries()).map(([label, group]) => (
              <optgroup key={label} label={label}>
                {group.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cityId" className="field-label">
            Населённый пункт
          </label>
          <select id="cityId" name="cityId" required defaultValue={defaultValues?.cityId ?? ""} className="field-input">
            <option value="" disabled>
              Выберите
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="addressText" className="field-label">
          Адрес
        </label>
        <input id="addressText" name="addressText" defaultValue={defaultValues?.addressText ?? ""} className="field-input" />
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={defaultValues?.description}
          className="field-input"
          placeholder="Чем занимается бизнес, что предлагаете клиентам..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="phone" className="field-label">
            Телефон
          </label>
          <input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} className="field-input" placeholder="+7..." />
        </div>
        <div>
          <label htmlFor="whatsapp" className="field-label">
            WhatsApp
          </label>
          <input id="whatsapp" name="whatsapp" defaultValue={defaultValues?.whatsapp ?? ""} className="field-input" placeholder="+7..." />
        </div>
        <div>
          <label htmlFor="instagram" className="field-label">
            Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            defaultValue={defaultValues?.instagram ?? ""}
            className="field-input"
            placeholder="@username"
          />
        </div>
        <div>
          <label htmlFor="website" className="field-label">
            Сайт
          </label>
          <input id="website" name="website" defaultValue={defaultValues?.website ?? ""} className="field-input" placeholder="https://..." />
        </div>
      </div>

      <div>
        <p className="field-label mb-2">Часы работы</p>
        <div className="space-y-2">
          {DAY_KEYS.map((day) => {
            const dayHours = defaultValues?.hours?.[day];
            return (
              <div key={day} className="flex items-center gap-2 text-sm">
                <span className="w-28 shrink-0 text-muted-foreground">{DAY_LABELS[day]}</span>
                <input
                  type="time"
                  name={`hours_${day}_open`}
                  defaultValue={dayHours?.open ?? "09:00"}
                  className="field-input mt-0 w-28"
                />
                <span className="text-muted-foreground">—</span>
                <input
                  type="time"
                  name={`hours_${day}_close`}
                  defaultValue={dayHours?.close ?? "18:00"}
                  className="field-input mt-0 w-28"
                />
                <label className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    name={`hours_${day}_closed`}
                    defaultChecked={dayHours?.closed ?? false}
                    className="h-4 w-4 accent-primary"
                  />
                  Выходной
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{state.success}</p>}

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? "Сохраняем..." : mode === "create" ? "Создать бизнес" : "Сохранить"}
      </button>
    </form>
  );
}
