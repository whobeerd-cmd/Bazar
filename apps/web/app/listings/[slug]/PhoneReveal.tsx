"use client";

import { useState } from "react";

// Замена полноценному чату: телефон продавца кликабельной tel:-ссылкой,
// скрыт за кнопкой "Показать телефон" — как у большинства досок объявлений,
// чтобы номер не собирали боты со страницы без единого клика.
export function PhoneReveal({ phone }: { phone: string | null }) {
  const [revealed, setRevealed] = useState(false);

  if (!phone) {
    return <p className="text-xs text-muted-foreground">Телефон не указан</p>;
  }

  if (!revealed) {
    return (
      <button type="button" onClick={() => setRevealed(true)} className="text-xs text-primary underline">
        Показать телефон
      </button>
    );
  }

  return (
    <a href={`tel:${phone}`} className="text-sm font-medium text-primary hover:underline">
      {phone}
    </a>
  );
}
