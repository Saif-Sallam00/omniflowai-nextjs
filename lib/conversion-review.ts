import { z } from "zod";

export const CONVERSION_HONEYPOT_FIELD = "_gotcha";

export const CONVERSION_MAIN_CHANNELS = ["Meta", "Google", "TikTok", "Other"] as const;
export type ConversionMainChannel = (typeof CONVERSION_MAIN_CHANNELS)[number];

export const CONVERSION_MONTHLY_SPENDS = [
  "Under $10k",
  "$10k – $25k",
  "$25k – $50k",
  "$50k+",
] as const;
export type ConversionMonthlySpend = (typeof CONVERSION_MONTHLY_SPENDS)[number];

export type ConversionReviewData = {
  storeUrl: string;
  runningPaidTraffic: "Yes" | "No";
  mainChannel: ConversionMainChannel | null;
  monthlySpend: ConversionMonthlySpend | null;
  email: string;
};

const MAX_URL_LENGTH = 2048;
const MAX_EMAIL_LENGTH = 254;
const MAX_SELECT_LENGTH = 50;

function isHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

const rawSchema = z.object({
  store_url: z.string().trim().min(1).max(MAX_URL_LENGTH).refine(isHttpUrl),
  running_paid_traffic: z.enum(["Yes", "No"]),
  main_channel: z.string().trim().max(MAX_SELECT_LENGTH).optional().default(""),
  monthly_spend: z.string().trim().max(MAX_SELECT_LENGTH).optional().default(""),
  email: z.string().trim().min(1).max(MAX_EMAIL_LENGTH).email(),
});

/**
 * Returns null on any invalid input. When running_paid_traffic is "No",
 * main_channel/monthly_spend are dropped unconditionally (never validated,
 * never surfaced) even if a request supplies values for them.
 */
export function parseConversionReview(input: unknown): ConversionReviewData | null {
  const parsed = rawSchema.safeParse(input);
  if (!parsed.success) return null;

  const { store_url, running_paid_traffic, main_channel, monthly_spend, email } = parsed.data;

  if (running_paid_traffic === "No") {
    return {
      storeUrl: store_url,
      runningPaidTraffic: "No",
      mainChannel: null,
      monthlySpend: null,
      email,
    };
  }

  if (!(CONVERSION_MAIN_CHANNELS as readonly string[]).includes(main_channel)) {
    return null;
  }
  if (monthly_spend !== "" && !(CONVERSION_MONTHLY_SPENDS as readonly string[]).includes(monthly_spend)) {
    return null;
  }

  return {
    storeUrl: store_url,
    runningPaidTraffic: "Yes",
    mainChannel: main_channel as ConversionMainChannel,
    monthlySpend: monthly_spend === "" ? null : (monthly_spend as ConversionMonthlySpend),
    email,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Hostname only, no protocol/path — safe to drop into a subject line. */
export function buildSubject(data: ConversionReviewData): string {
  const domain = new URL(data.storeUrl).hostname.replace(/^www\./, "");
  const parts = ["3-Point Review", domain];
  if (data.mainChannel) parts.push(data.mainChannel);
  if (data.monthlySpend) parts.push(data.monthlySpend);
  return parts.join(" — ");
}

export function buildEmailContent(data: ConversionReviewData): { text: string; html: string } {
  const channelText = data.mainChannel ?? "Not applicable";
  const spendText =
    data.runningPaidTraffic === "Yes" ? (data.monthlySpend ?? "Not provided") : "Not applicable";

  const text = [
    "New 3-Point Conversion Review",
    "",
    "Store URL:",
    data.storeUrl,
    "",
    "Running paid traffic:",
    data.runningPaidTraffic,
    "",
    "Main paid channel:",
    channelText,
    "",
    "Monthly paid media spend:",
    spendText,
    "",
    "Work email:",
    data.email,
  ].join("\n");

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.6;color:#111;">
<h2 style="margin:0 0 16px;">New 3-Point Conversion Review</h2>
<p style="margin:0 0 12px;"><strong>Store URL:</strong><br><a href="${escapeHtml(data.storeUrl)}">${escapeHtml(data.storeUrl)}</a></p>
<p style="margin:0 0 12px;"><strong>Running paid traffic:</strong><br>${escapeHtml(data.runningPaidTraffic)}</p>
<p style="margin:0 0 12px;"><strong>Main paid channel:</strong><br>${escapeHtml(channelText)}</p>
<p style="margin:0 0 12px;"><strong>Monthly paid media spend:</strong><br>${escapeHtml(spendText)}</p>
<p style="margin:0;"><strong>Work email:</strong><br>${escapeHtml(data.email)}</p>
</div>`;

  return { text, html };
}
