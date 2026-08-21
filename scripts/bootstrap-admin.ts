import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auth_user } from "@/lib/db/schema";

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("ADMIN_USERNAME and ADMIN_PASSWORD must be set");
    process.exit(1);
  }

  const existing = await db
    .select({ id: auth_user.id })
    .from(auth_user)
    .where(eq(auth_user.username, username))
    .limit(1);

  if (existing.length > 0) {
    console.log("Admin already exists — no action taken");
    process.exit(0);
  }

  await auth.api.signUpEmail({
    body: {
      email: `${username}@omniflowai.local`,
      name: username,
      username,
      displayUsername: username,
      password,
    },
  });

  console.log("Admin created");
  process.exit(0);
}

main();
