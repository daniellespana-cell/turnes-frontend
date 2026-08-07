export async function onRequest(context) {
  const assetResponse = await context.env.ASSETS.fetch(context.request);
  
  const url = new URL(context.request.url);
  const contentType = assetResponse.headers.get('content-type') || '';

  // If the browser is asking for a JS/CSS asset in /assets/ 
  // BUT Cloudflare's internal fallback is giving it HTML (text/html)...
  // That means the asset is ACTUALLY missing (404), and Cloudflare is masking it!
  // We MUST return a real 404, or else the browser crashes with MIME type error.
  if (url.pathname.startsWith('/assets/') && contentType.includes('text/html')) {
    return new Response('Asset not found', { status: 404 });
  }

  // Otherwise, if it's a 404 for a user route (like /dashboard), serve index.html
  if (assetResponse.status === 404) {
    const indexRequest = new Request(new URL('/index.html', url), context.request);
    return context.env.ASSETS.fetch(indexRequest);
  }

  // Return the original response
  return assetResponse;
}
