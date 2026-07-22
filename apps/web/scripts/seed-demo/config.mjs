// ============================================================================
// Bazar — конфиг генератора демо-объявлений
// Все "магические числа" и словари в одном месте, как просили.
// ============================================================================

export const SETTINGS = {
  listingsPerCategory: { min: 8, max: 12 },
  imagesPerCategoryPool: 40, // запасное значение, если importer не передал точный расчёт
  imagesPerListing: { min: 1, max: 4 },
  backdateDays: { min: 0, max: 60 }, // разброс "даты публикации"
  vipChance: 0.06,
  demoEmailDomain: "bazar-demo.local",
  seedBotEmail: "seed-bot@bazar-demo.local",
  requestDelayMs: 250, // пауза между внешними запросами (Pexels/Storage), чтобы не долбить лимиты
};

// Более крупные/известные населённые пункты — чаще, мелкие — реже (просто для реализма).
export const CITY_WEIGHTS = [
  { name: "Назрань", weight: 6 },
  { name: "Магас", weight: 4 },
  { name: "Малгобек", weight: 5 },
  { name: "Карабулак", weight: 5 },
  { name: "Сунжа", weight: 4 },
  { name: "Плиево", weight: 3 },
  { name: "Экажево", weight: 3 },
  { name: "Кантышево", weight: 2 },
  { name: "Сурхахи", weight: 2 },
  { name: "Долгое", weight: 1 },
  { name: "Нестеровская", weight: 2 },
  { name: "Троицкая", weight: 2 },
  { name: "Джейрах", weight: 1 },
  { name: "Яндаре", weight: 1 },
  { name: "Барсуки", weight: 1 },
  { name: "Али-Юрт", weight: 1 },
  { name: "Алхасты", weight: 1 },
  { name: "Верхние Ачалуки", weight: 1 },
  { name: "Средние Ачалуки", weight: 1 },
  { name: "Нижние Ачалуки", weight: 1 },
  { name: "Пседах", weight: 1 },
  { name: "Сагопши", weight: 1 },
  { name: "Вознесенская", weight: 1 },
];

// Мужские/женские имена и фамилии, типичные для региона — только для
// генерации вымышленных демо-профилей, не привязаны к конкретным людям.
export const MALE_FIRST_NAMES = [
  "Магомед", "Ислам", "Аслан", "Иса", "Хусейн", "Адам", "Башир", "Юсуп",
  "Ахмед", "Микаил", "Мурад", "Тимур", "Хасан", "Илез", "Мухьаммад", "Заур",
  "Руслан", "Бекхан", "Умар", "Идрис", "Ваха", "Алихан", "Тагир", "Якуб",
];
export const FEMALE_FIRST_NAMES = [
  "Хава", "Малика", "Зара", "Диана", "Милана", "Айшат", "Асет", "Лейла",
  "Мадина", "Фатима", "Зарема", "Хяди", "Танзила", "Луиза", "Асма", "Хадижат",
  "Марьям", "Сацита", "Пятимат", "Радима",
];
export const SURNAMES = [
  "Нальгиев", "Мальсагов", "Оздоев", "Евлоев", "Гагиев", "Дидигов", "Дзейтов",
  "Аушев", "Костоев", "Хамхоев", "Барахоев", "Цечоев", "Гойгов", "Ториев",
  "Марзиев", "Хашагульгов", "Ахриев", "Мержоев", "Тумгоев", "Долтмурзиев",
];

// ----------------------------------------------------------------------------
// Архетипы контента: каждая категория ссылается на один архетип + свой набор
// слов (товары/бренды) и поисковый запрос для фото на Pexels.
// ----------------------------------------------------------------------------
export const CATEGORY_CONFIG = {
  // --- Автомобили ---
  "legkovye-avtomobili": { archetype: "vehicle", pexels: "sedan car", items: ["ВАЗ 2114", "Приора", "Гранта", "Toyota Camry", "Hyundai Solaris", "Kia Rio", "Ford Focus", "Renault Logan", "Nissan Almera", "Volkswagen Polo"], priceMin: 150000, priceMax: 1800000 },
  "gruzoviki-i-spetstehnika": { archetype: "vehicle", pexels: "truck", items: ["ГАЗель", "КамАЗ", "МАЗ", "трактор МТЗ", "экскаватор"], priceMin: 300000, priceMax: 3500000, itemPexels: { "ГАЗель": "cargo van", "КамАЗ": "truck", "МАЗ": "truck", "трактор МТЗ": "farm tractor", "экскаватор": "excavator construction" } },
  "mototransport": { archetype: "vehicle", pexels: "motorcycle", items: ["скутер", "мопед Альфа", "мотоцикл Racer", "квадроцикл"], priceMin: 30000, priceMax: 400000 },
  "avtozapchasti": { archetype: "generic-item", pexels: "car parts", items: ["комплект тормозных колодок", "амортизаторы", "радиатор охлаждения", "стартер", "генератор", "фары", "бампер", "капот"], priceMin: 500, priceMax: 25000 },
  "shiny-i-diski": { archetype: "generic-item", pexels: "car tires wheels", items: ["зимняя резина R15", "литые диски R16", "летняя резина R14", "комплект колёс"], priceMin: 3000, priceMax: 40000 },
  "tyuning": { archetype: "generic-item", pexels: "car tuning", items: ["спойлер", "тонировка", "обвес", "выхлопная система"], priceMin: 2000, priceMax: 30000 },
  "avtozvuk": { archetype: "generic-item", pexels: "car audio speakers", items: ["сабвуфер", "усилитель", "автомагнитола", "колонки"], priceMin: 1500, priceMax: 20000 },
  "avtouslugi": { archetype: "service", pexels: "car service garage", items: ["автомойка", "выездной шиномонтаж", "диагностика авто", "полировка кузова", "автоэлектрик"], priceMin: 500, priceMax: 5000 },

  // --- Недвижимость ---
  "kvartiry": { archetype: "realestate", pexels: "apartment interior", items: ["1-комнатная квартира", "2-комнатная квартира", "3-комнатная квартира", "квартира-студия"], priceMin: 1500000, priceMax: 6500000, rentMin: 8000, rentMax: 35000 },
  "doma": { archetype: "realestate", pexels: "house exterior", items: ["дом с участком", "коттедж", "частный дом", "дом на две семьи"], priceMin: 2500000, priceMax: 12000000, rentMin: 15000, rentMax: 50000 },
  "zemelnye-uchastki": { archetype: "realestate", pexels: "land plot field", items: ["участок под ИЖС", "земельный участок", "участок с фундаментом"], priceMin: 400000, priceMax: 3500000 },
  "kommercheskaya-nedvizhimost": { archetype: "realestate", pexels: "commercial building", items: ["торговое помещение", "офисное помещение", "склад", "магазин"], priceMin: 1500000, priceMax: 9000000, rentMin: 20000, rentMax: 90000 },
  "garazhi-i-parkovki": { archetype: "realestate", pexels: "garage", items: ["капитальный гараж", "парковочное место", "гараж с погребом"], priceMin: 150000, priceMax: 900000 },

  // --- Телефоны ---
  "smartfony": { archetype: "electronics", pexels: "smartphone", items: ["iPhone 12", "iPhone 13", "Samsung Galaxy A54", "Xiaomi Redmi Note 12", "Samsung Galaxy S22", "Realme 10"], priceMin: 6000, priceMax: 75000 },
  "remont-telefonov": { archetype: "service", pexels: "phone repair", items: ["замена экрана", "ремонт телефона", "замена батареи"], priceMin: 500, priceMax: 5000 },
  "sim-karty": { archetype: "generic-item", pexels: "sim card", items: ["красивый номер", "SIM-карта с паспортом"], priceMin: 300, priceMax: 15000 },
  "aksessuary-dlya-telefonov": { archetype: "generic-item", pexels: "phone case accessories", items: ["чехол", "защитное стекло", "беспроводная зарядка", "powerbank", "наушники"], priceMin: 200, priceMax: 3500 },

  // --- Компьютеры ---
  "nastolnye-pk": { archetype: "electronics", pexels: "desktop computer", items: ["игровой ПК", "офисный компьютер", "системный блок"], priceMin: 12000, priceMax: 90000 },
  "igrovye-pristavki": { archetype: "electronics", pexels: "game console", items: ["PlayStation 5", "PlayStation 4", "Xbox Series S", "Nintendo Switch"], priceMin: 15000, priceMax: 55000 },
  "komplektuyuschie": { archetype: "generic-item", pexels: "computer parts", items: ["видеокарта", "материнская плата", "оперативная память", "блок питания", "SSD диск"], priceMin: 1500, priceMax: 45000 },
  "noutbuki": { archetype: "electronics", pexels: "laptop", items: ["ноутбук Lenovo", "ноутбук HP", "ноутбук Asus", "MacBook Air", "ноутбук Acer"], priceMin: 15000, priceMax: 95000 },
  "aksessuary-dlya-kompyutera": { archetype: "generic-item", pexels: "computer accessories keyboard mouse", items: ["клавиатура", "мышь", "веб-камера", "коврик для мыши"], priceMin: 300, priceMax: 5000 },
  "orgtehnika": { archetype: "electronics", pexels: "printer office", items: ["принтер", "МФУ", "сканер"], priceMin: 2500, priceMax: 25000 },
  "planshety": { archetype: "electronics", pexels: "tablet device", items: ["iPad", "Samsung Galaxy Tab", "планшет Huawei"], priceMin: 6000, priceMax: 55000 },

  // --- Электроника ---
  "videonablyudenie": { archetype: "electronics", pexels: "security camera", items: ["комплект видеонаблюдения", "IP-камера"], priceMin: 2000, priceMax: 25000 },
  "audio-i-video": { archetype: "electronics", pexels: "speaker audio system", items: ["колонки", "музыкальный центр", "проектор"], priceMin: 1500, priceMax: 30000 },
  "sputnikovoe-tv": { archetype: "electronics", pexels: "satellite dish", items: ["спутниковая тарелка", "ресивер"], priceMin: 1500, priceMax: 8000 },
  "fototehnika": { archetype: "electronics", pexels: "camera photography", items: ["фотоаппарат Canon", "фотоаппарат Nikon", "экшн-камера"], priceMin: 5000, priceMax: 60000 },
  "umnye-chasy-i-gadzhety": { archetype: "electronics", pexels: "smart watch", items: ["умные часы", "фитнес-браслет"], priceMin: 2000, priceMax: 25000 },
  "akkaunty-i-cifrovye-tovary": { archetype: "generic-item", pexels: "digital account", items: ["аккаунт с играми", "подписка"], priceMin: 300, priceMax: 5000 },

  // --- Бытовая техника ---
  "televizory": { archetype: "electronics", pexels: "television", items: ["телевизор Samsung", "телевизор LG", "Smart TV"], priceMin: 8000, priceMax: 55000 },
  "melkaya-tehnika": { archetype: "electronics", pexels: "kitchen appliance", items: ["микроволновка", "мультиварка", "блендер", "пылесос"], priceMin: 1500, priceMax: 15000, itemPexels: { "микроволновка": "microwave oven", "мультиварка": "multicooker", "блендер": "blender kitchen", "пылесос": "vacuum cleaner" } },
  "kondicionery": { archetype: "electronics", pexels: "air conditioner", items: ["сплит-система", "кондиционер"], priceMin: 8000, priceMax: 35000 },
  "holodilniki": { archetype: "electronics", pexels: "refrigerator kitchen", items: ["холодильник Samsung", "холодильник Indesit", "холодильник LG"], priceMin: 8000, priceMax: 45000 },
  "stiralnye-mashiny": { archetype: "electronics", pexels: "washing machine", items: ["стиральная машина", "стиральная машина с сушкой"], priceMin: 7000, priceMax: 35000 },

  // --- Одежда/обувь ---
  "zhenskaya-odezhda": { archetype: "clothing", pexels: "women fashion clothing", items: ["платье", "туника", "костюм", "пальто", "куртка"], priceMin: 500, priceMax: 8000 },
  "muzhskaya-odezhda": { archetype: "clothing", pexels: "men fashion clothing", items: ["рубашка", "костюм", "куртка", "спортивный костюм"], priceMin: 500, priceMax: 9000 },
  "odezhda-aksessuary": { archetype: "generic-item", pexels: "fashion accessories bag", items: ["сумка", "ремень", "шарф", "перчатки"], priceMin: 300, priceMax: 4000 },
  "zhenskaya-obuv": { archetype: "clothing", pexels: "women shoes", items: ["туфли", "сапоги", "кроссовки"], priceMin: 800, priceMax: 6000 },
  "muzhskaya-obuv": { archetype: "clothing", pexels: "men shoes", items: ["ботинки", "кроссовки", "туфли"], priceMin: 800, priceMax: 7000 },
  "detskaya-obuv": { archetype: "clothing", pexels: "kids shoes", items: ["детские кроссовки", "детские сапожки"], priceMin: 400, priceMax: 3000 },

  // --- Для детей ---
  "detskaya-odezhda-i-obuv": { archetype: "clothing", pexels: "kids clothing", items: ["детский комбинезон", "детская куртка", "комплект одежды"], priceMin: 300, priceMax: 3500 },
  "igrushki": { archetype: "generic-item", pexels: "kids toys", items: ["конструктор", "кукла", "радиоуправляемая машинка", "мягкая игрушка"], priceMin: 300, priceMax: 4000, itemPexels: { "конструктор": "building blocks toy", "кукла": "doll toy", "радиоуправляемая машинка": "rc toy car", "мягкая игрушка": "plush toy" } },
  "kolyaski-i-avtokresla": { archetype: "generic-item", pexels: "baby stroller", items: ["коляска", "автокресло", "переноска"], priceMin: 2000, priceMax: 20000 },
  "detskaya-mebel": { archetype: "generic-item", pexels: "kids furniture room", items: ["детская кроватка", "манеж", "детский стол"], priceMin: 2000, priceMax: 18000 },

  // --- Дом и сад ---
  "rasteniya-i-cvety": { archetype: "generic-item", pexels: "plants flowers pot", items: ["комнатное растение", "рассада", "саженцы"], priceMin: 200, priceMax: 3000 },
  "podarki-i-suveniry": { archetype: "generic-item", pexels: "gifts souvenirs", items: ["подарочный набор", "сувенир", "часы настенные"], priceMin: 300, priceMax: 4000 },
  "posuda-i-tekstil": { archetype: "generic-item", pexels: "kitchenware textile", items: ["набор посуды", "постельное бельё", "шторы"], priceMin: 500, priceMax: 6000, itemPexels: { "набор посуды": "dinnerware set", "постельное бельё": "bedding linen", "шторы": "curtains window" } },
  "osveschenie-i-dekor": { archetype: "generic-item", pexels: "home decor lighting", items: ["люстра", "торшер", "картина", "ковёр"], priceMin: 500, priceMax: 8000, itemPexels: { "люстра": "chandelier ceiling light", "торшер": "floor lamp", "картина": "wall painting art", "ковёр": "carpet rug" } },
  "hoztovary": { archetype: "generic-item", pexels: "household goods", items: ["набор для уборки", "хозтовары"], priceMin: 200, priceMax: 2500 },

  // --- Стройматериалы ---
  "santehnika": { archetype: "generic-item", pexels: "plumbing bathroom", items: ["смеситель", "унитаз", "раковина", "душевая кабина"], priceMin: 1500, priceMax: 25000 },
  "otoplenie-i-ventilyaciya": { archetype: "generic-item", pexels: "heating boiler", items: ["газовый котёл", "радиатор отопления", "вентилятор промышленный"], priceMin: 3000, priceMax: 45000, itemPexels: { "газовый котёл": "gas boiler heating", "радиатор отопления": "radiator heating", "вентилятор промышленный": "industrial fan" } },
  "otdelochnye-materialy": { archetype: "generic-item", pexels: "construction materials tiles", items: ["плитка", "ламинат", "обои", "штукатурка"], priceMin: 500, priceMax: 15000 },
  "elektrika": { archetype: "generic-item", pexels: "electrical wiring tools", items: ["кабель", "розетки и выключатели", "щиток электрический"], priceMin: 300, priceMax: 10000 },
  "instrumenty": { archetype: "generic-item", pexels: "hand tools", items: ["перфоратор", "болгарка", "шуруповёрт", "набор инструментов"], priceMin: 1500, priceMax: 20000 },
  "dveri-i-okna": { archetype: "generic-item", pexels: "windows doors", items: ["входная дверь", "межкомнатная дверь", "пластиковое окно"], priceMin: 3000, priceMax: 40000 },

  // --- Мебель ---
  "dlya-spalni": { archetype: "generic-item", pexels: "bedroom furniture", items: ["кровать", "шкаф", "матрас", "прикроватная тумба"], priceMin: 3000, priceMax: 45000 },
  "dlya-kuhni": { archetype: "generic-item", pexels: "kitchen furniture", items: ["кухонный гарнитур", "обеденный стол", "стулья"], priceMin: 3000, priceMax: 60000 },
  "dlya-gostinoy": { archetype: "generic-item", pexels: "living room furniture sofa", items: ["диван", "кресло", "журнальный столик", "стенка"], priceMin: 4000, priceMax: 70000 },
  "ofisnaya-mebel": { archetype: "generic-item", pexels: "office furniture desk", items: ["офисный стол", "офисное кресло", "стеллаж"], priceMin: 2000, priceMax: 25000 },
  "dlya-vannoy": { archetype: "generic-item", pexels: "bathroom furniture", items: ["тумба для ванной", "зеркало с подсветкой"], priceMin: 2000, priceMax: 15000 },
  "sborka-i-remont-mebeli": { archetype: "service", pexels: "furniture assembly", items: ["сборка мебели", "ремонт мебели", "перетяжка дивана"], priceMin: 500, priceMax: 5000 },
  "drugaya-mebel": { archetype: "generic-item", pexels: "furniture", items: ["стеллаж", "тумба", "полка"], priceMin: 1500, priceMax: 20000 },

  // --- Хобби ---
  "knigi": { archetype: "generic-item", pexels: "books stack", items: ["собрание сочинений", "детские книги", "учебники"], priceMin: 100, priceMax: 2000 },
  "muzykalnye-instrumenty": { archetype: "generic-item", pexels: "musical instrument guitar", items: ["гитара", "синтезатор", "барабаны"], priceMin: 2000, priceMax: 30000, itemPexels: { "гитара": "acoustic guitar", "синтезатор": "synthesizer keyboard", "барабаны": "drum kit" } },
  "kollekcionirovanie": { archetype: "generic-item", pexels: "collectibles antique", items: ["монеты", "значки", "марки"], priceMin: 300, priceMax: 8000, itemPexels: { "монеты": "coins collection", "значки": "pin badges collection", "марки": "postage stamps collection" } },
  "rukodelie": { archetype: "generic-item", pexels: "craft supplies sewing", items: ["швейная машинка", "пряжа", "набор для рукоделия"], priceMin: 500, priceMax: 8000 },

  // --- Спорт ---
  "velosipedy": { archetype: "generic-item", pexels: "bicycle", items: ["горный велосипед", "городской велосипед", "детский велосипед"], priceMin: 4000, priceMax: 35000 },
  "ohota-i-rybalka": { archetype: "generic-item", pexels: "fishing hunting gear", items: ["удочка", "спиннинг", "палатка", "снаряжение для охоты"], priceMin: 500, priceMax: 15000 },
  "trenazhery": { archetype: "generic-item", pexels: "gym equipment", items: ["беговая дорожка", "велотренажёр", "гантели"], priceMin: 2000, priceMax: 40000 },
  "sportivnaya-odezhda": { archetype: "clothing", pexels: "sportswear", items: ["спортивный костюм", "кроссовки для бега"], priceMin: 800, priceMax: 6000 },
  "sportivnoe-pitanie": { archetype: "generic-item", pexels: "sports nutrition supplements", items: ["протеин", "гейнер", "витамины спортивные"], priceMin: 800, priceMax: 5000 },
  "turizm": { archetype: "generic-item", pexels: "camping tourism gear", items: ["туристическая палатка", "рюкзак походный", "спальный мешок"], priceMin: 1000, priceMax: 12000 },

  // --- Бизнес ---
  "oborudovanie-dlya-biznesa": { archetype: "generic-item", pexels: "business equipment", items: ["кассовый аппарат", "холодильная витрина", "торговое оборудование"], priceMin: 5000, priceMax: 150000 },
  "prodazha-biznesa": { archetype: "service", pexels: "small business shop", items: ["готовый бизнес", "продажа магазина", "продажа кафе"], priceMin: 200000, priceMax: 3000000 },
  "delovoe-partnerstvo": { archetype: "service", pexels: "business partnership", items: ["ищу партнёра по бизнесу", "инвестиции в проект"], priceMin: 0, priceMax: 0 },

  // --- Сельское хозяйство ---
  "zhivotnye": { archetype: "generic-item", pexels: "farm animal", items: ["телёнок", "баран", "корова", "щенок", "котёнок"], priceMin: 1000, priceMax: 60000, itemPexels: { "телёнок": "calf cow", "баран": "ram sheep", "корова": "cow", "щенок": "puppy dog", "котёнок": "kitten cat" } },
  "ptitsy": { archetype: "generic-item", pexels: "chicken poultry farm", items: ["куры несушки", "утки", "гуси", "индюки"], priceMin: 300, priceMax: 3000, itemPexels: { "куры несушки": "chicken hen", "утки": "duck", "гуси": "goose", "индюки": "turkey bird" } },
  "korma": { archetype: "generic-item", pexels: "animal feed grain", items: ["комбикорм", "сено", "зерно"], priceMin: 300, priceMax: 2500, itemPexels: { "комбикорм": "animal feed bag", "сено": "hay bales", "зерно": "grain wheat" } },
  "selhozoborudovanie": { archetype: "generic-item", pexels: "agricultural equipment", items: ["плуг", "культиватор", "мотоблок"], priceMin: 5000, priceMax: 200000, itemPexels: { "плуг": "plow farm", "культиватор": "cultivator farm", "мотоблок": "walk behind tractor" } },
  "produkty-pitaniya": { archetype: "generic-item", pexels: "farm produce food", items: ["домашний мёд", "фермерский сыр", "овощи с огорода"], priceMin: 200, priceMax: 2000 },
  "rasteniya-selhoz": { archetype: "generic-item", pexels: "crop plants field", items: ["саженцы фруктовых деревьев", "рассада овощей"], priceMin: 100, priceMax: 1500 },
  "pchely": { archetype: "generic-item", pexels: "beekeeping honey", items: ["пчелосемьи", "улей", "мёд"], priceMin: 1000, priceMax: 15000 },

  // --- Работа ---
  "vakansii": { archetype: "job-vacancy", pexels: "workplace office", items: ["продавец", "водитель", "разнорабочий", "менеджер", "повар", "охранник"], priceMin: 20000, priceMax: 60000 },
  "ischu-rabotu": { archetype: "job-seeking", pexels: "workplace office", items: ["продавец", "водитель", "разнорабочий", "няня", "репетитор", "сантехник"], priceMin: 0, priceMax: 0 },

  // --- Услуги (все — service, без фото по умолчанию) ---
  "remont-i-stroitelstvo": { archetype: "service", pexels: "construction repair", items: ["ремонт квартир под ключ", "штукатурные работы", "укладка плитки"], priceMin: 500, priceMax: 5000 },
  "gruzoperevozki": { archetype: "service", pexels: "moving truck delivery", items: ["грузоперевозки по городу", "переезды", "услуги грузчиков"], priceMin: 500, priceMax: 8000 },
  "prazdniki-i-meropriyatiya": { archetype: "service", pexels: "event celebration", items: ["организация свадеб", "тамада", "фото и видеосъёмка"], priceMin: 3000, priceMax: 40000 },
  "krasota-i-zdorove": { archetype: "service", pexels: "beauty salon", items: ["маникюр", "стрижка", "макияж", "массаж"], priceMin: 500, priceMax: 4000 },
  "obuchenie-i-repetitorstvo": { archetype: "service", pexels: "tutoring education", items: ["репетитор по математике", "уроки английского", "подготовка к ЕГЭ"], priceMin: 500, priceMax: 2000 },
  "it-uslugi": { archetype: "service", pexels: "computer programming", items: ["создание сайтов", "настройка компьютеров", "ремонт ноутбуков"], priceMin: 1000, priceMax: 30000 },
  "yuridicheskie-i-finansovye": { archetype: "service", pexels: "law office documents", items: ["юридическая консультация", "составление договоров", "бухгалтерские услуги"], priceMin: 1000, priceMax: 10000 },
  "remont-bytovoy-tehniki": { archetype: "service", pexels: "appliance repair", items: ["ремонт холодильников", "ремонт стиральных машин", "ремонт телевизоров"], priceMin: 500, priceMax: 5000 },
  "prochie-uslugi": { archetype: "service", pexels: "handyman service", items: ["курьерские услуги", "клининг", "мелкий ремонт"], priceMin: 500, priceMax: 5000 },

  // --- Прочее ---
  "otdam-darom": { archetype: "free-item", pexels: "household items box", items: ["старый шкаф", "детские вещи", "книги", "строительные остатки"] },
  "raznoe": { archetype: "generic-item", pexels: "flea market items", items: ["разные вещи", "остатки от ремонта", "разное"], priceMin: 100, priceMax: 3000 },
};
