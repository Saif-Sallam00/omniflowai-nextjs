import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
  user: {
    modelName: "auth_user",
  },
  session: {
    modelName: "auth_session",
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: false,
    },
  },
  account: {
    modelName: "auth_account",
  },
  verification: {
    modelName: "auth_verification",
  },
  rateLimit: {
    // Explicitly false (not left to Better Auth's own NODE_ENV-based default,
    // which auto-enables in production) — Phase 3 prerequisite: Replit's
    // trusted-client-IP source is not yet verified. Schema/storage still
    // exist (FR-4.10) so no migration is needed to enable this later.
    enabled: false,
    modelName: "auth_rate_limit",
    storage: "database",
  },
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
});
