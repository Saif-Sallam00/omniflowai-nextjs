"use server";

import { after } from "next/server";
import {
  contactFormSchema,
  newsletterSchema,
  HONEYPOT_FIELD,
  type ContactFieldName,
} from "@/lib/contact";
import { createLead, createNewsletterLead } from "@/lib/db/leads";
import { notifyNewLead } from "@/lib/notify";

function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === "string" && value.trim() !== "";
}

function readString(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

// A "use server" file may only export async functions — the state types
// below are erased at compile time (type-only exports), but the matching
// initial-state values live inline in each client component instead.
export type ContactFormValues = Record<ContactFieldName, string>;

export type ContactActionState = {
  status: "idle" | "success" | "error";
  fieldErrors: Partial<Record<ContactFieldName, string[]>>;
  // React resets a <form action> on every settled submission, success or
  // error — so on error we echo the submitted values back for the client to
  // restore (the user's input must not be lost); null clears the form.
  submittedValues: ContactFormValues | null;
};

export async function submitContactAction(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  if (isHoneypotFilled(formData)) {
    return { status: "success", fieldErrors: {}, submittedValues: null };
  }

  const raw: ContactFormValues = {
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    company: readString(formData, "company"),
    service: readString(formData, "service"),
    message: readString(formData, "message"),
  };

  const validated = contactFormSchema.safeParse(raw);
  if (!validated.success) {
    return {
      status: "idle",
      fieldErrors: validated.error.flatten().fieldErrors,
      submittedValues: raw,
    };
  }

  try {
    const lead = await createLead(validated.data);
    // Fire-and-forget — the lead is already saved; email must never fail the request.
    after(() => notifyNewLead(lead));
    return { status: "success", fieldErrors: {}, submittedValues: null };
  } catch (error) {
    console.error("[contact] Failed to save lead:", error);
    return { status: "error", fieldErrors: {}, submittedValues: raw };
  }
}

export type NewsletterActionState = {
  status: "idle" | "success" | "error";
  submittedEmail: string | null;
};

export async function subscribeNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  if (isHoneypotFilled(formData)) {
    return { status: "success", submittedEmail: null };
  }

  const email = readString(formData, "email");
  const validated = newsletterSchema.safeParse({ email });
  if (!validated.success) {
    return { status: "error", submittedEmail: email };
  }

  try {
    const lead = await createNewsletterLead(validated.data.email);
    // Fire-and-forget — the lead is already saved; email must never fail the request.
    after(() => notifyNewLead(lead));
    return { status: "success", submittedEmail: null };
  } catch (error) {
    console.error("[subscribe] Failed to save newsletter lead:", error);
    return { status: "error", submittedEmail: email };
  }
}
