import { pick, intBetween, roundPrice } from "./rng.mjs";

const CLOSERS = [
  "Состояние хорошее, все вопросы по телефону.",
  "Возможен небольшой торг при осмотре.",
  "Пишите в WhatsApp, отвечаю быстро.",
  "Продаю в связи с переездом.",
  "Торг уместен.",
  "Самовывоз, могу подсказать по доставке.",
  "Причина продажи — не подошло.",
  "Чистое, аккуратно использовалось.",
  "Обмен не интересует, только продажа.",
  "Звоните в любое время дня.",
];

const CONDITION_PHRASES = {
  new: ["Новое, не использовалось.", "Новое, в упаковке.", "Абсолютно новое состояние."],
  used: ["Б/у, но в хорошем состоянии.", "Использовалось аккуратно.", "Есть небольшие следы использования."],
};

function randomDescription(intro, condition) {
  const parts = [intro];
  if (condition) parts.push(pick(CONDITION_PHRASES[condition]));
  parts.push(pick(CLOSERS));
  return parts.join(" ");
}

function priceIn(config, min, max) {
  return roundPrice(intBetween(min ?? config.priceMin, max ?? config.priceMax));
}

const ARCHETYPES = {
  vehicle(item, config) {
    const condition = Math.random() < 0.85 ? "used" : "new";
    const year = intBetween(2005, 2023);
    return {
      title: `${item}, ${year} год`,
      description: randomDescription(`Продаю ${item}, ${year} год выпуска. На ходу, документы в порядке.`, condition),
      price: priceIn(config),
      priceType: "negotiable",
      condition,
      dealType: null,
    };
  },

  realestate(item, config) {
    const isRent = config.rentMin != null && Math.random() < 0.3;
    const dealType = isRent ? "rent_out" : "sale";
    const price = isRent ? priceIn(config, config.rentMin, config.rentMax) : priceIn(config);
    return {
      title: isRent ? `Сдам: ${item}` : `Продам: ${item}`,
      description: randomDescription(
        `${isRent ? "Сдаётся" : "Продаётся"}: ${item}. Хороший ремонт, все коммуникации подключены, тихий район.`,
        null
      ),
      price,
      priceType: "negotiable",
      condition: "used",
      dealType,
    };
  },

  electronics(item, config) {
    const condition = Math.random() < 0.55 ? "used" : "new";
    return {
      title: `${item}${condition === "new" ? " (новый)" : ""}`,
      description: randomDescription(`Продаю ${item}. Полностью рабочее, проверено.`, condition),
      price: priceIn(config),
      priceType: Math.random() < 0.7 ? "negotiable" : "fixed",
      condition,
      dealType: null,
    };
  },

  clothing(item, config) {
    const condition = Math.random() < 0.5 ? "used" : "new";
    const size = pick(["XS", "S", "M", "L", "XL", "42", "44", "46", "48"]);
    return {
      title: `${item}, размер ${size}`,
      description: randomDescription(`Продаю ${item}, размер ${size}.`, condition),
      price: priceIn(config),
      priceType: "negotiable",
      condition,
      dealType: null,
    };
  },

  "generic-item"(item, config) {
    const condition = Math.random() < 0.5 ? "used" : "new";
    return {
      title: item.charAt(0).toUpperCase() + item.slice(1),
      description: randomDescription(`Продаю: ${item}.`, condition),
      price: priceIn(config),
      priceType: Math.random() < 0.6 ? "negotiable" : "fixed",
      condition,
      dealType: null,
    };
  },

  service(item, config) {
    const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
    return {
      title: capitalized,
      description: `${capitalized}. Работаю по Ингушетии, качественно и в срок. ${pick(CLOSERS)}`,
      price: priceIn(config),
      priceType: "negotiable",
      condition: "used",
      dealType: null,
    };
  },

  "job-vacancy"(item, config) {
    return {
      title: `Требуется: ${item}`,
      description: `В связи с расширением требуется ${item}. Официальное оформление, стабильная оплата. Звоните для собеседования.`,
      price: priceIn(config),
      priceType: "fixed",
      condition: "used",
      dealType: null,
    };
  },

  "job-seeking"(item) {
    return {
      title: `Ищу работу: ${item}`,
      description: `Рассмотрю вакансию ${item}. Есть опыт, ответственный подход к работе. Звоните, обсудим детали.`,
      price: 0,
      priceType: "negotiable",
      condition: "used",
      dealType: null,
    };
  },

  "free-item"(item) {
    return {
      title: `Отдам даром: ${item}`,
      description: `Отдам ${item} даром в хорошие руки. Самовывоз.`,
      price: 0,
      priceType: "free",
      condition: "used",
      dealType: null,
    };
  },
};

export function generateListingContent(category) {
  const config = category.config;
  const item = pick(config.items);
  const generator = ARCHETYPES[config.archetype] ?? ARCHETYPES["generic-item"];
  return generator(item, config);
}
