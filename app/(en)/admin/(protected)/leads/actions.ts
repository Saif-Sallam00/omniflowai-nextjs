"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";
import { leadStatusEnum } from "@/lib/db/schema";
import { updateLeadStatus, deleteLead } from "@/lib/db/leads";

const statusSchema = z.enum(leadStatusEnum.enumValues);

export async function updateLeadStatusAction(id: number, formData: FormData): Promise<void> {
  await requireAuth();

  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) return;

  await updateLeadStatus(id, parsed.data);
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(id: number): Promise<void> {
  await requireAuth();

  await deleteLead(id);
  revalidatePath("/admin/leads");
}
