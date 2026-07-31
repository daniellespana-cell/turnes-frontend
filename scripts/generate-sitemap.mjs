import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://turnes.co';

// 1. Rutas estáticas principales y legales
const staticRoutes = [
  '/',
  '/explorar',
  '/precios',
  '/about',
  '/contacto',
  '/privacidad',
  '/terminos',
  '/politicas',
  '/politica-pagos',
  '/politica-cookies'
];

// 2. Slugs de roles dinámicos que tienen landing pages de marketing
const roleSlugs = [
  'reposteria',
  'barista',
  'cocinero',
  'bartender',
  'ayudante',
  'mesero',
  'seguridad',
  'logistica'
];

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const allUrls = [
    ...staticRoutes.map(route => ({
      loc: `${DOMAIN}${route}`,
      lastmod: currentDate,
      changefreq: route === '/' ? 'daily' : 'weekly',
      priority: route === '/' ? '1.0' : route === '/explorar' ? '0.9' : '0.7'
    })),
    ...roleSlugs.map(slug => ({
      loc: `${DOMAIN}/explorar/${slug}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    }))
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
  
  console.log(`✅ Sitemap generado exitosamente en: ${sitemapPath}`);
  console.log(`🔗 Total de URLs: ${allUrls.length}`);
};

generateSitemap();
