import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch public vacancies
    const { data: vacantes, error } = await supabase
      .from('vacantes')
      .select('id, updated_at')
      .eq('estado', 'activa') // Asumimos 'activa' o 'publicada'
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching vacantes:', error);
      throw error;
    }

    const baseUrl = 'https://turnes.co';

    // Base URLs
    const urls = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/explorar`, changefreq: 'hourly', priority: '0.9' },
      { loc: `${baseUrl}/acerca-de`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/contacto`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${baseUrl}/precios`, changefreq: 'weekly', priority: '0.8' },
    ];

    // Dynamic Vacancy URLs
    if (vacantes) {
      vacantes.forEach(v => {
        urls.push({
          loc: `${baseUrl}/vacante/${v.id}`,
          changefreq: 'daily',
          priority: '0.9', // High priority for fresh jobs
        });
      });
    }

    // Construct XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    urls.forEach(u => {
      xml += `  <url>\n`;
      xml += `    <loc>${u.loc}</loc>\n`;
      xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
      xml += `    <priority>${u.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600" // Cache for 1 hour
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
