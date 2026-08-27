import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/contact";
import type { Lead } from "@/lib/db/leads";

const DEFAULT_FROM = "OmniflowAI Leads <onboarding@resend.dev>";

/**
 * Fire-and-forget lead notification. Never blocks or fails the caller.
 * Skipped silently (logged) when RESEND_API_KEY is not configured — the lead
 * is saved to the DB regardless.
 */
export async function notifyNewLead(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[leads] RESEND_API_KEY not set — skipping email notification (lead saved to DB).");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const to = process.env.NOTIFY_EMAIL || CONTACT_EMAIL;
    const from = process.env.RESEND_FROM || DEFAULT_FROM;
    // The SDK resolves with { data, error } for API-level failures (e.g. an
    // invalid key) instead of throwing — both paths must be handled, or a
    // failed send silently logs as "sent".
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `New ${lead.source} lead: ${lead.name || lead.email}`,
      text: [
        `Source: ${lead.source}`,
        `Name: ${lead.name || "-"}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone || "-"}`,
        `Company: ${lead.company || "-"}`,
        `Service: ${lead.service || "-"}`,
        "",
        "Message:",
        lead.message || "-",
      ].join("\n"),
    });
    if (error) {
      console.error("[leads] Email notification failed (lead already saved):", error);
      return;
    }
    console.log(`[leads] Notification email sent to ${to}.`);
  } catch (err) {
    console.error("[leads] Email notification failed (lead already saved):", err);
  }
}
