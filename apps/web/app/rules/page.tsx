import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Правила размещения",
  description: "Правила размещения объявлений и рекомендации по безопасной сделке на Bazar.",
};

const PROHIBITED = [
  "Оружие, боеприпасы, взрывчатые вещества",
  "Наркотические и психотропные вещества",
  "Поддельные документы, деньги и товары с поддельным брендом",
  "Товары и услуги, требующие лицензии, без указания на её наличие",
  "Объявления, вводящие в заблуждение: ложная цена, чужие фотографии, несуществующий товар",
  "Реклама финансовых пирамид и схем лёгкого заработка",
];

const SAFETY_TIPS = [
  "Встречайтесь в людных местах и осматривайте товар перед оплатой",
  "Не переводите предоплату незнакомому продавцу — в 90% случаев это мошенничество",
  "Проверяйте документы при сделках с недвижимостью и автомобилями",
  "Если что-то похоже на обман — используйте кнопку «Пожаловаться» на странице объявления",
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Правила размещения</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Bazar — площадка объявлений от частных лиц Республики Ингушетия. Мы не берём комиссию
        со сделок и не выступаем стороной сделки между покупателем и продавцом — только
        размещаем объявления и модерируем их перед публикацией.
      </p>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Как проходит публикация</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Каждое новое объявление проверяется модератором перед тем, как появиться в каталоге —
        обычно это занимает не больше нескольких часов. Если объявление отклонили, причина
        будет видна автору в разделе «Мои объявления».
      </p>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Запрещено размещать</h2>
      <ul className="mt-3 space-y-2">
        {PROHIBITED.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground">
            <span className="text-muted-foreground">—</span>
            {item}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">Как не стать жертвой обмана</h2>
      <ul className="mt-3 space-y-2">
        {SAFETY_TIPS.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-foreground">
            <span className="text-muted-foreground">—</span>
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-muted-foreground">
        Нарушение правил — основание для отклонения или снятия объявления с публикации, а при
        повторных нарушениях — для блокировки аккаунта.
      </p>
    </div>
  );
}
