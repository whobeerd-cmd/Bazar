export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Понедельник",
  tue: "Вторник",
  wed: "Среда",
  thu: "Четверг",
  fri: "Пятница",
  sat: "Суббота",
  sun: "Воскресенье",
};

export type DayHours = { open: string; close: string; closed: boolean };
export type BusinessHours = Partial<Record<DayKey, DayHours>>;

// JS Date.getDay(): 0 = воскресенье ... 6 = суббота — переводим в наши ключи.
function jsDayToKey(jsDay: number): DayKey {
  return DAY_KEYS[(jsDay + 6) % 7]!;
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

const MOSCOW_WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

// Вся Ингушетия — часовой пояс Europe/Moscow (без перехода на летнее/зимнее время).
// Часы работы вводятся владельцем в местном времени, поэтому сравниваем их с
// текущим временем именно в этой зоне, а не в зоне сервера — на Vercel сервер
// работает в UTC, и без явного пересчёта статус "открыто/закрыто" был бы сдвинут на 3 часа.
function getMoscowParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(date);
  const find = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    hour: Number(find("hour")),
    minute: Number(find("minute")),
    jsDay: MOSCOW_WEEKDAYS[find("weekday")] ?? 0,
  };
}

// "Открыто до 20:00" / "Закрыто, откроется в 9:00" / "" (часы не заполнены)
export function getOpenStatus(hours: BusinessHours | null | undefined, now = new Date()) {
  if (!hours) return null;

  const { hour, minute, jsDay } = getMoscowParts(now);
  const todayKey = jsDayToKey(jsDay);
  const today = hours[todayKey];
  const nowMinutes = hour * 60 + minute;

  if (today && !today.closed && today.open && today.close) {
    const openMin = toMinutes(today.open);
    const closeMin = toMinutes(today.close);
    if (nowMinutes >= openMin && nowMinutes < closeMin) {
      return { isOpen: true, label: `Открыто до ${today.close}` };
    }
  }

  // Ищем ближайший день открытия, начиная с сегодняшнего.
  for (let i = 0; i < 7; i += 1) {
    const key = DAY_KEYS[(DAY_KEYS.indexOf(todayKey) + i) % 7]!;
    const day = hours[key];
    if (day && !day.closed && day.open) {
      if (i === 0) return { isOpen: false, label: `Закрыто, откроется в ${day.open}` };
      return { isOpen: false, label: `Закрыто, откроется в ${DAY_LABELS[key].toLowerCase()} в ${day.open}` };
    }
  }

  return { isOpen: false, label: "Закрыто" };
}
