import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { withRequestLogging } from "@/lib/logger";
import { withErrorHandling } from "@/lib/error-handler";

const handlers = toNextJsHandler(auth);

export const GET = withRequestLogging(withErrorHandling(handlers.GET));
export const POST = withRequestLogging(withErrorHandling(handlers.POST));
export const PATCH = withRequestLogging(withErrorHandling(handlers.PATCH));
export const PUT = withRequestLogging(withErrorHandling(handlers.PUT));
export const DELETE = withRequestLogging(withErrorHandling(handlers.DELETE));
