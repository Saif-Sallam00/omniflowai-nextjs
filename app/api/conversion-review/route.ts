import { Resend } from "resend";
import {
  buildEmailContent,
  buildSubject,
  CONVERSION_HONEYPOT_FIELD,
  parseConversionReview,
} from "@/lib/conversion-review";
import { withErrorHandling } from "@/lib/error-handler";
import { withRequestLogging } from "@/lib/logger";

const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

// Per-instance, in-memory. Fine for this endpoint's traffic — no shared
// store across instances is required for "a reasonable starting point".
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

// Replit's edge proxy sets x-forwarded-for to the real client IP; it isn't
// chained through other untrusted hops the app would need to strip.
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const first = forwardedFor?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

async function postConversionReview(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (isRateLimited(getClientIp(request))) {
    return Response.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const gotcha = (body as Record<string, unknown>)[CONVERSION_HONEYPOT_FIELD];
  if (typeof gotcha === "string" && gotcha.trim() !== "") {
    // Bot filled the honeypot — report success without sending anything.
    return Response.json({ ok: true });
  }

  const data = parseConversionReview(body);
  if (!data) {
    return Response.json(
      { ok: false, message: "Please check your submission and try again." },
      { status: 400 },
    );
  }

  const apiKey = process.env.CONVERSION_RESEND_API_KEY;
  const from = process.env.CONVERSION_RESEND_FROM;
  const to = process.env.CONVERSION_NOTIFY_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("[conversion-review] Missing CONVERSION_RESEND_* env configuration.");
    return Response.json({ ok: false, message: "Unable to submit request." }, { status: 503 });
  }

  const { text, html } = buildEmailContent(data);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: buildSubject(data),
      text,
      html,
    });

    if (error) {
      console.error("[conversion-review] Resend send failed:", error);
      return Response.json({ ok: false, message: "Unable to submit request." }, { status: 500 });
    }
  } catch (err) {
    console.error("[conversion-review] Resend send failed:", err);
    return Response.json({ ok: false, message: "Unable to submit request." }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export const POST = withRequestLogging(withErrorHandling(postConversionReview));
