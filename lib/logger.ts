type RouteHandler = (request: Request, ctx: unknown) => Promise<Response> | Response;

/**
 * Wraps a Route Handler export to emit one structured JSON log line per
 * request to stdout. Never has access to the response body — only method,
 * path, status, and duration are ever read off the Request/Response objects.
 */
export function withRequestLogging(handler: RouteHandler): RouteHandler {
  return async (request, ctx) => {
    const start = Date.now();
    const response = await handler(request, ctx);
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: request.method,
        path: new URL(request.url).pathname,
        status: response.status,
        duration,
      }),
    );
    return response;
  };
}
