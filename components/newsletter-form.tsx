"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { subscribeNewsletterAction, type NewsletterActionState } from "@/lib/actions/leads";
import { HONEYPOT_FIELD } from "@/lib/contact";
import type { Language } from "@/lib/language";
import { useActionAttempt } from "@/lib/hooks/use-action-attempt";

const INITIAL_STATE: NewsletterActionState = { status: "idle", submittedEmail: null };

const COPY = {
  en: {
    subscribed: "Thanks — you're subscribed.",
    error: "Something went wrong, please try again.",
  },
  ar: {
    subscribed: "شكراً — تم اشتراكك.",
    error: "حدث خطأ ما، حاول مجدداً.",
  },
} satisfies Record<Language, Record<string, string>>;

function SubmitButton({ ariaLabel }: { ariaLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Send className="h-4 w-4" />
    </button>
  );
}

export function NewsletterForm({
  language,
  placeholder,
}: {
  language: Language;
  placeholder: string;
}) {
  const copy = COPY[language];
  const [state, formAction] = useActionState(subscribeNewsletterAction, INITIAL_STATE);
  // See useActionAttempt: forces a remount with the echoed-back value so an
  // error restores what was typed instead of losing it to React's automatic
  // form reset, while a success still clears the input.
  const attempt = useActionAttempt(state);

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex gap-2" noValidate>
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="newsletter-website">Leave this field empty</label>
          <input
            type="text"
            id="newsletter-website"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <input
          key={`email-${attempt}`}
          type="email"
          name="email"
          required
          defaultValue={state.submittedEmail ?? ""}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        />
        <SubmitButton ariaLabel={placeholder} />
      </form>
      {state.status === "success" && (
        <p role="status" className="text-xs text-emerald-400">
          {copy.subscribed}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-xs text-red-400">
          {copy.error}
        </p>
      )}
    </div>
  );
}
