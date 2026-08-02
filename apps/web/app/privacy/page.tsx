import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description: "Как Bazar собирает, хранит и использует персональные данные пользователей.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        Политика обработки персональных данных
      </h1>
      <p className="mt-2 text-xs text-muted-foreground">Действует с 2 августа 2026 года</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Настоящая политика определяет, какие персональные данные собирает площадка объявлений
        Bazar (bazar06.ru, далее — «Сайт»), как они используются и как ими распорядиться. Сайт
        администрируется физическим лицом (далее — «Оператор»). Регистрируясь на Сайте, вы
        соглашаетесь с условиями настоящей политики.
      </p>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Какие данные собираются</h2>
      <ul className="mt-3 space-y-2 text-sm text-foreground">
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>имя профиля</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>номер телефона (по желанию — для связи по объявлениям)</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>адрес электронной почты</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>фотографии, загруженные к объявлениям и бизнес-профилю</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>геолокация объявления или бизнеса, если вы её указали</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>технические данные о посещении сайта (IP-адрес, файлы cookie)</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Для чего используются данные</h2>
      <ul className="mt-3 space-y-2 text-sm text-foreground">
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>регистрация и работа личного кабинета</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>публикация объявлений и бизнес-профилей</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>связь между покупателями и продавцами (телефон, WhatsApp, чат на Сайте)</li>
        <li className="flex gap-2"><span className="text-muted-foreground">—</span>модерация объявлений, защита от спама и мошенничества</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Кому передаются данные</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Для работы Сайта используются сторонние технические сервисы, которые обрабатывают данные
        от имени Оператора: Supabase (база данных и хранилище файлов), Vercel (хостинг),
        Cloudflare (защита от автоматических регистраций), Google (если вы входите через
        Google-аккаунт). Эти сервисы не используют ваши данные в собственных целях. Серверы базы
        данных физически расположены в Евросоюзе (Ирландия).
      </p>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Согласие и его отзыв</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Регистрируясь на Сайте, вы даёте согласие на обработку персональных данных в перечисленных
        целях. Отозвать согласие и запросить удаление своих данных можно в любой момент — через
        раздел «Профиль» в личном кабинете, кнопка «Удалить аккаунт и мои данные».
      </p>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Хранение и удаление</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Данные хранятся, пока у вас есть аккаунт на Сайте. После запроса на удаление аккаунт,
        объявления, бизнес-профиль и связанные с ними персональные данные удаляются в разумный
        срок, за исключением случаев, когда их сохранение требуется по закону.
      </p>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Как связаться с Оператором</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        По вопросам, связанным с персональными данными, используйте форму запроса в разделе
        «Профиль» личного кабинета.
      </p>
    </div>
  );
}
