import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import type { ContactFormData } from "@/lib/contact";

export type Lead = typeof leads.$inferSelect;

export async function createLead(data: ContactFormData): Promise<Lead> {
  const [lead] = await db
    .insert(leads)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      service: data.service,
      message: data.message,
      source: "contact",
    })
    .returning();
  return lead;
}

export async function createNewsletterLead(email: string): Promise<Lead> {
  const [lead] = await db
    .insert(leads)
    .values({
      email,
      source: "newsletter",
    })
    .returning();
  return lead;
}
