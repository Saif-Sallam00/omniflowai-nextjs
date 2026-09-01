import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";

export type Image = typeof images.$inferSelect;

export async function createImage(data: string): Promise<Image> {
  const [image] = await db.insert(images).values({ data }).returning();
  return image;
}

export async function getImageById(id: string): Promise<Image | null> {
  const [image] = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return image ?? null;
}
