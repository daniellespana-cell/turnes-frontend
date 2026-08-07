export async function onRequest(context) {
  // Intentar cargar el archivo real (JS, CSS, HTML, imagen, etc)
  const assetResponse = await context.env.ASSETS.fetch(context.request);
  
  // Si el archivo existe (200 OK), devuélvelo tal cual
  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const url = new URL(context.request.url);

  // CRÍTICO: Si falta un archivo JS/CSS de la carpeta /assets/, 
  // DEBEMOS devolver un error 404 real. 
  // Si devolvemos index.html aquí, causamos el error "MIME type text/html"
  if (url.pathname.startsWith('/assets/')) {
    return assetResponse; 
  }

  // Si no es un asset, es una ruta de usuario (ej. /dashboard, /profile).
  // Como es una SPA, devolvemos el index.html
  const indexRequest = new Request(new URL('/index.html', url), context.request);
  return context.env.ASSETS.fetch(indexRequest);
}
