const LEGACY_ORIGIN = "https://www.giccmasjid.org";
const LEGACY_RESOLVE_OVERRIDE = "giccmasjid.org";
const PRIVATE_PATH_SEGMENTS = new Set(["error_log", "process_logs"]);

type PagesContext = {
  request: Request;
  params: { path?: string | string[] };
};

type CloudflareRequestInit = RequestInit & {
  cf: { resolveOverride: string };
};

function unavailableResponse() {
  return new Response("The MFAS service is temporarily unavailable.", {
    status: 502,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isPrivatePath(path: string | string[] | undefined) {
  const segments = Array.isArray(path) ? path : path ? [path] : [];
  return segments.some((segment) => PRIVATE_PATH_SEGMENTS.has(segment.toLowerCase()));
}

export const onRequest = async ({ request, params }: PagesContext) => {
  if (isPrivatePath(params.path)) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, LEGACY_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("Host");
  headers.delete("Content-Length");

  const init: CloudflareRequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    signal: request.signal,
    cf: { resolveOverride: LEGACY_RESOLVE_OVERRIDE },
  };
  if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;

  try {
    const upstream = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set("Cache-Control", "no-store");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.delete("Server");
    responseHeaders.delete("X-Powered-By");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("legacy_mfas_proxy_failed", {
      message: error instanceof Error ? error.message : "Unknown upstream error",
      path: incomingUrl.pathname,
    });
    return unavailableResponse();
  }
};
