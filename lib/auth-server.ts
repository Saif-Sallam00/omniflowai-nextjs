import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

// redirect() has a `never` return type and throws internally (NEXT_REDIRECT) —
// that's why requireAuth() can return Promise<Session> with no null/undefined variant.
export async function requireAuth(): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/auth");
  return session;
}
