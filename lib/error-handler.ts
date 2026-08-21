type RouteHandler = (request: Request, ctx: unknown) => Promise<Response> | Response;

/**
 * Wraps a Route Handler export so any thrown error becomes a JSON
 * `{ message }` response instead of leaking a stack trace. Stack traces are
 * only logged server-side (stdout), and only included in the response body
 * outside production.
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, ctx) => {
    try {
      return await handler(request, ctx);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Internal server error";
      const isProduction = process.env.NODE_ENV === "production";
      return Response.json(
        {
          message,
          ...(isProduction ? {} : { stack: error instanceof Error ? error.stack : undefined }),
        },
        { status: 500 },
      );
    }
  };
}
