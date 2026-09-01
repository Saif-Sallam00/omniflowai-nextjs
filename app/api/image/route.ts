import sharp from "sharp";
import { getSessionOrNull } from "@/lib/auth-server";
import { createImage } from "@/lib/db/images";
import { withErrorHandling } from "@/lib/error-handler";
import { withRequestLogging } from "@/lib/logger";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

async function uploadImage(request: Request): Promise<Response> {
  const session = await getSessionOrNull(request);
  if (!session) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_UPLOAD_BYTES) {
    return Response.json({ message: "File too large" }, { status: 413 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ message: "Missing image file" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ message: "File too large" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let processed: Buffer;
  try {
    processed = await sharp(buffer)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return Response.json({ message: "Invalid or corrupt image" }, { status: 400 });
  }

  const dataUri = `data:image/webp;base64,${processed.toString("base64")}`;
  const image = await createImage(dataUri);

  return Response.json({ id: image.id, url: `/api/image/${image.id}` }, { status: 200 });
}

export const POST = withRequestLogging(withErrorHandling(uploadImage));
