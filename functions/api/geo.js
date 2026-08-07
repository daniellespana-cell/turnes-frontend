/**
 * 🌐 Cloudflare Pages Function: /api/geo
 * 
 * Retorna la ubicación aproximada del visitante basada en su IP.
 * Cloudflare inyecta automáticamente `request.cf` con datos geográficos
 * en cada request que pasa por su red CDN.
 * 
 * Este endpoint es GRATIS, no requiere API keys, y se ejecuta en el edge
 * más cercano al usuario (~1ms de latencia).
 * 
 * Uso desde el frontend: fetch('/api/geo').then(r => r.json())
 */
export async function onRequest(context) {
  const cf = context.request.cf || {};

  return Response.json({
    city:      cf.city      || null,
    region:    cf.region    || null,
    country:   cf.country   || null,
    latitude:  cf.latitude  || null,
    longitude: cf.longitude || null,
    timezone:  cf.timezone  || null,
  }, {
    headers: {
      'Cache-Control': 'private, max-age=300', // 5min cache por sesión
      'Access-Control-Allow-Origin': '*',
    }
  });
}
