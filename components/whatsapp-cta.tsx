import { MessageCircle } from "lucide-react";
import type { Language } from "@/lib/language";

const WHATSAPP_URL = "https://wa.me/201119936014";

const CHAT_LABEL: Record<Language, string> = {
  en: "Chat with us",
  ar: "تواصل معنا",
};

export function WhatsappCta({ language }: Readonly<{ language: Language }>) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-8 right-8 z-50"
    >
      <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75 group-hover:opacity-100" />

      <div className="relative flex items-center gap-2 rounded-full bg-primary p-4 text-primary-foreground shadow-2xl transition-transform hover:scale-110">
        <MessageCircle className="h-8 w-8" />

        <span className="hidden whitespace-nowrap pe-2 font-bold transition-all group-hover:block">
          {CHAT_LABEL[language]}
        </span>
      </div>
    </a>
  );
}
