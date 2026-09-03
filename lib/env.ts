import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .url("DATABASE_URL must be a valid URL"),
  DATABASE_URL_UNPOOLED: z
    .string()
    .min(1, "DATABASE_URL_UNPOOLED is required")
    .url("DATABASE_URL_UNPOOLED must be a valid URL"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(1, "BETTER_AUTH_SECRET is required")
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z
    .string()
    .min(1, "BETTER_AUTH_URL is required")
    .url("BETTER_AUTH_URL must be a valid URL"),
  SITE_URL: z
    .string()
    .min(1, "SITE_URL is required")
    .url("SITE_URL must be a valid URL")
    .refine((value) => !value.endsWith("/"), "SITE_URL must not end with a trailing slash"),
});

function parseEnv(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    const messages =
      error instanceof z.ZodError
        ? error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        : [String(error)];
    console.error(`Invalid environment configuration:\n${messages.map((m) => `- ${m}`).join("\n")}`);
    process.exit(1);
  }
}

export const env: z.infer<typeof envSchema> =
  process.env.NODE_ENV === "production"
    ? parseEnv()
    : (process.env as unknown as z.infer<typeof envSchema>);
