import { z } from "zod";

export const CONTACT_EMAIL = "contact@omniflowai.net";

export const CONTACT_SERVICES = [
  "foundation",
  "growth-engine",
  "scale-infrastructure",
  "custom",
  "not-sure",
] as const;
export type ContactService = (typeof CONTACT_SERVICES)[number];

export function parseContactService(value: string | undefined): ContactService {
  return (CONTACT_SERVICES as readonly string[]).includes(value ?? "")
    ? (value as ContactService)
    : "not-sure";
}

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.enum(CONTACT_SERVICES),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactFieldName = keyof ContactFormData;

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type NewsletterData = z.infer<typeof newsletterSchema>;

/**
 * Shared honeypot field name for both the contact and newsletter forms. A
 * filled value means a bot filled every input it could find — the Server
 * Actions drop the submission silently and report success so it gets no
 * signal. Lives here (not in lib/actions/leads.ts) because a "use server"
 * file may only export async functions, not plain constants.
 */
export const HONEYPOT_FIELD = "website";
