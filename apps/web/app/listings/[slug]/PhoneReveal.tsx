"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

// Замена полноценному чату: телефон продавца кликабельной tel:-ссылкой,
// скрыт за кнопкой "Показать телефон" — как у большинства досок объявлений,
// чтобы номер не собирали боты со страницы без единого клика.
export function PhoneReveal({ phone }: { phone: string | null }) {
  const [revealed, setRevealed] = useState(false);

  if (!phone) {
    return <p className="text-center text-sm text-muted-foreground">Телефон не указан</p>;
  }

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="btn-primary inline-flex w-full items-center justify-center gap-2 py-2.5 text-[15px]"
      >
        <Phone className="h-4 w-4" />
        Показать телефон
      </button>
    );
  }

  return (
    <a
      href={`tel:${phone}`}
      className="btn-primary inline-flex w-full items-center justify-center gap-2 py-2.5 text-[15px]"
    >
      <Phone className="h-4 w-4" />
      {phone}
    </a>
  );
}
