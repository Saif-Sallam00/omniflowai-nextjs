import { headers } from "next/headers";

// Temporary verification endpoint for the Cloudflare CF-IPCountry rollout —
// confirms headers().get("cf-ipcountry") sees what the edge actually sends,
// in both local dev and staging (staging runs a production build, so this is
// gated on an explicit flag rather than NODE_ENV). Remove once the
// production path is confirmed and this is no longer needed.
export async function GET() {
  if (process.env.DEBUG_GEO_HEADERS !== "true") {
    return new Response("Not found", { status: 404 });
  }

  const requestHeaders = await headers();

  return Response.json({
    "cf-ipcountry": requestHeaders.get("cf-ipcountry"),
    "cf-connecting-ip": requestHeaders.get("cf-connecting-ip"),
    "cf-ray": requestHeaders.get("cf-ray"),
    "x-forwarded-for": requestHeaders.get("x-forwarded-for"),
    "x-real-ip": requestHeaders.get("x-real-ip"),
  });
}
