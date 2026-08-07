/**
 * Cloudflare Pages SPA fallback.
 * Always tries to serve the real static asset first.
 * Only falls back to index.html if the asset doesn't exist (404).
 */
export async function onRequest(context) {
  // First, try to serve the actual static file from Cloudflare's asset store
  const assetResponse = await context.env.ASSETS.fetch(context.request);

  // If the asset exists (200, 304, etc.), return it as-is
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  // Asset not found → this is a SPA client-side route → serve index.html
  const url = new URL(context.request.url);
  const indexRequest = new Request(new URL('/index.html', url), context.request);
  return context.env.ASSETS.fetch(indexRequest);
}
