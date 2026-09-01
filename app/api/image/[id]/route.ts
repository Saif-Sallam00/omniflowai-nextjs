import { getImageById } from "@/lib/db/images";
import { withErrorHandling } from "@/lib/error-handler";
import { withRequestLogging } from "@/lib/logger";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function serveImage(_request: Request, ctx: unknown): Promise<Response> {
  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;

  // getImageById does `eq(images.id, id)` against a uuid column — a non-UUID
  // string makes Postgres throw 22P02 rather than returning null, so the
  // shape must be checked before the query runs.
  if (!UUID_PATTERN.test(id)) {
    return Response.json({ message: "Image not found" }, { status: 404 });
  }

  const image = await getImageById(id);
  if (!image) {
    return Response.json({ message: "Image not found" }, { status: 404 });
  }

  const base64Data = image.data.replace(/^data:image\/webp;base64,/, "");
  const bytes = Buffer.from(base64Data, "base64");

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export const GET = withRequestLogging(withErrorHandling(serveImage));
