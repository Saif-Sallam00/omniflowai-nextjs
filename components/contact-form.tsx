"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { submitContactAction, type ContactActionState } from "@/lib/actions/leads";
import { CONTACT_SERVICES, HONEYPOT_FIELD, type ContactService } from "@/lib/contact";
import type { Language } from "@/lib/language";
import { useActionAttempt } from "@/lib/hooks/use-action-attempt";

const INITIAL_STATE: ContactActionState = {
  status: "idle",
  fieldErrors: {},
  submittedValues: null,
};

const INPUT_CLASSNAME =
  "w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none";

const COPY = {
  en: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    optional: "(optional)",
    company: "Company",
    service: "What do you need?",
    message: "Message",
    phName: "Your name",
    phEmail: "you@company.com",
    phPhone: "+20 100 000 0000",
    phCompany: "Your Company",
    phService: "Select a service",
    phMessage: "Tell us about your project goals...",
    submit: "Send message",
    submitting: "Sending…",
    toastSuccess: "Message sent — we'll get back to you within 24 hours.",
    toastError: "Something went wrong — please try again, or email us directly.",
    serviceOptions: {
      foundation: "Foundation",
      "growth-engine": "Growth Engine",
      "scale-infrastructure": "Scale Infrastructure",
      custom: "Custom Transformation",
      "not-sure": "Not sure yet",
    },
  },
  ar: {
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    optional: "(اختياري)",
    company: "الشركة",
    service: "ما الذي تحتاجه؟",
    message: "الرسالة",
    phName: "اسمك",
    phEmail: "you@company.com",
    phPhone: "+20 100 000 0000",
    phCompany: "اسم شركتك",
    phService: "اختر خدمة",
    phMessage: "أخبرنا عن أهداف مشروعك...",
    submit: "إرسال الرسالة",
    submitting: "جارٍ الإرسال…",
    toastSuccess: "تم إرسال الرسالة — سنعاود التواصل معك خلال 24 ساعة.",
    toastError: "حدث خطأ ما — حاول مجدداً، أو راسلنا مباشرةً عبر البريد.",
    serviceOptions: {
      foundation: "Foundation",
      "growth-engine": "Growth Engine",
      "scale-infrastructure": "Scale Infrastructure",
      custom: "Custom Transformation",
      "not-sure": "لست متأكداً بعد",
    },
  },
} satisfies Record<Language, Record<string, unknown>>;

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
      {!pending && <ArrowRight className="ms-2 h-4 w-4" />}
    </button>
  );
}

export function ContactForm({
  language,
  defaultService,
}: {
  language: Language;
  defaultService: ContactService;
}) {
  const copy = COPY[language];
  const [state, formAction] = useActionState(submitContactAction, INITIAL_STATE);
  // React resets a <form action> on every settled submission (success or
  // error) — remounting each field with the echoed-back value on a fresh
  // key overrides that, so an error restores what the user typed and a
  // success clears it back to blank (service back to the url-derived default).
  const attempt = useActionAttempt(state);
  const values = state.submittedValues;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input type="text" id="contact-website" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm text-slate-300">
            {copy.name}
          </label>
          <input
            key={`name-${attempt}`}
            id="contact-name"
            name="name"
            type="text"
            defaultValue={values?.name ?? ""}
            placeholder={copy.phName}
            className={INPUT_CLASSNAME}
          />
          {state.fieldErrors.name?.[0] && (
            <p role="alert" className="mt-1.5 text-sm text-red-400">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-2 block text-sm text-slate-300">
            {copy.email}
          </label>
          <input
            key={`email-${attempt}`}
            id="contact-email"
            name="email"
            type="email"
            defaultValue={values?.email ?? ""}
            placeholder={copy.phEmail}
            className={INPUT_CLASSNAME}
          />
          {state.fieldErrors.email?.[0] && (
            <p role="alert" className="mt-1.5 text-sm text-red-400">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="mb-2 block text-sm text-slate-300">
            {copy.phone} <span className="text-xs text-slate-500">{copy.optional}</span>
          </label>
          <input
            key={`phone-${attempt}`}
            id="contact-phone"
            name="phone"
            type="tel"
            defaultValue={values?.phone ?? ""}
            placeholder={copy.phPhone}
            className={INPUT_CLASSNAME}
          />
          {state.fieldErrors.phone?.[0] && (
            <p role="alert" className="mt-1.5 text-sm text-red-400">
              {state.fieldErrors.phone[0]}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contact-company" className="mb-2 block text-sm text-slate-300">
            {copy.company} <span className="text-xs text-slate-500">{copy.optional}</span>
          </label>
          <input
            key={`company-${attempt}`}
            id="contact-company"
            name="company"
            type="text"
            defaultValue={values?.company ?? ""}
            placeholder={copy.phCompany}
            className={INPUT_CLASSNAME}
          />
          {state.fieldErrors.company?.[0] && (
            <p role="alert" className="mt-1.5 text-sm text-red-400">
              {state.fieldErrors.company[0]}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-service" className="mb-2 block text-sm text-slate-300">
          {copy.service}
        </label>
        <select
          key={`service-${attempt}`}
          id="contact-service"
          name="service"
          defaultValue={(values?.service as ContactService | undefined) ?? defaultService}
          className={`${INPUT_CLASSNAME} appearance-none`}
        >
          {CONTACT_SERVICES.map((s) => (
            <option key={s} value={s} className="bg-slate-900">
              {copy.serviceOptions[s]}
            </option>
          ))}
        </select>
        {state.fieldErrors.service?.[0] && (
          <p role="alert" className="mt-1.5 text-sm text-red-400">
            {state.fieldErrors.service[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm text-slate-300">
          {copy.message}
        </label>
        <textarea
          key={`message-${attempt}`}
          id="contact-message"
          name="message"
          defaultValue={values?.message ?? ""}
          placeholder={copy.phMessage}
          className={`${INPUT_CLASSNAME} min-h-32 resize-none`}
        />
        {state.fieldErrors.message?.[0] && (
          <p role="alert" className="mt-1.5 text-sm text-red-400">
            {state.fieldErrors.message[0]}
          </p>
        )}
      </div>

      {state.status === "success" && (
        <p role="status" className="text-sm text-emerald-400">
          {copy.toastSuccess}
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-400">
          {copy.toastError}
        </p>
      )}

      <SubmitButton label={copy.submit} pendingLabel={copy.submitting} />
    </form>
  );
}
