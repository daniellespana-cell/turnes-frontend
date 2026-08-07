/**
 * Cloudflare Pages SPA fallback function.
 * Handles all non-asset routes by serving index.html,
 * enabling client-side routing (React Router) to work correctly.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Let Cloudflare serve real static files directly (assets, manifest, sw, etc.)
  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/functions/') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return context.next();
  }

  // For all SPA routes, serve index.html
  const indexUrl = new URL('/index.html', url);
  return context.env.ASSETS.fetch(indexUrl);
}
