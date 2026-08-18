const ID_PATTERN = /^[A-Za-z0-9_-]{10,100}$/;

function errorResponse(status: number) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

function isTrustedReferer(request: Request, url: URL): boolean {
  const referer = request.headers.get("Referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === url.origin;
  } catch {
    return false;
  }
}

async function fetchDriveImage(id: string, signal: AbortSignal) {
  const upstream = await fetch(`https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w480`, {
    redirect: "follow",
    signal,
  });
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    throw new Error(`Drive thumbnail request failed with status ${upstream.status} (${contentType})`);
  }
  return { body: await upstream.arrayBuffer(), contentType };
}

export const onRequestGet = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  if (!isTrustedReferer(request, url)) return errorResponse(403);

  const id = url.searchParams.get("id") ?? "";
  if (!ID_PATTERN.test(id)) return errorResponse(400);

  const cache = (caches as CacheStorage & { default: Cache }).default;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const staleUrl = new URL(url.toString());
  staleUrl.searchParams.set("gicc-cache", "stale");
  const staleCacheKey = new Request(staleUrl, { method: "GET" });

  try {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  } catch (error) {
    console.warn("Unable to read the poster cache; continuing with the upstream fetch", error);
  }

  try {
    const { body, contentType } = await fetchDriveImage(id, request.signal);
    const headers = { "Content-Type": contentType, "X-Content-Type-Options": "nosniff" };
    const response = new Response(body, {
      status: 200,
      headers: { ...headers, "Cache-Control": "public, max-age=604800" },
    });
    const staleResponse = new Response(body, {
      status: 200,
      headers: { ...headers, "Cache-Control": "public, max-age=2592000" },
    });
    const cacheWrites = await Promise.allSettled([
      cache.put(cacheKey, response.clone()),
      cache.put(staleCacheKey, staleResponse),
    ]);
    if (cacheWrites.some((write) => write.status === "rejected")) {
      console.warn("Unable to update one or more poster cache entries");
    }
    return response;
  } catch (error) {
    console.warn("Poster thumbnail unavailable from Google Drive; checking for a stale copy", error);
    try {
      const stale = await cache.match(staleCacheKey);
      if (stale) return stale;
    } catch (cacheError) {
      console.warn("Unable to read the stale poster cache entry", cacheError);
    }
    return errorResponse(502);
  }
};
