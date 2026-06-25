import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Lista de bots comunes que no renderizan JS bien o son pre-visualizadores
const BOT_AGENTS = [
  "googlebot", "bingbot", "yandexbot", "duckduckbot", "slurp", "baiduspider",
  "twitterbot", "facebookexternalhit", "linkedinbot", "embedly", "baiduspider",
  "pinterest", "slackbot", "vkshare", "facebot", "outbrain", "w3c_validator",
  "whatsapp", "telegrambot", "discordbot"
];

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";
    const isBot = BOT_AGENTS.some(bot => userAgent.includes(bot));

    const match = url.searchParams.get('id'); // e.g. ?id=uuid
    const vacanteId = match;

    if (!vacanteId) {
      return new Response("Missing vacante ID", { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: vacante, error } = await supabase
      .from('vacantes')
      .select(`
        *,
        perfiles:empresa_id (
          company_name,
          avatar_url
        )
      `)
      .eq('id', vacanteId)
      .single();

    if (error || !vacante) {
      return new Response("Not found", { status: 404 });
    }

    const title = `Turno de ${vacante.cargo} - ${vacante.perfiles?.company_name} | Turnes`;
    const description = vacante.descripcion?.substring(0, 160) || "Encuentra este turno en Turnes.";
    const imageUrl = vacante.perfiles?.avatar_url || "https://turnes.co/logo-turnes.png";
    const jobUrl = `https://turnes.co/vacante/${vacante.id}`;

    // Schema.org JobPosting
    const schema = {
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": vacante.cargo,
      "description": vacante.descripcion,
      "datePosted": vacante.created_at,
      "validThrough": vacante.fecha_fin || vacante.created_at,
      "employmentType": "PART_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": vacante.perfiles?.company_name,
        "logo": imageUrl
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": vacante.direccion || "Colombia",
          "addressCountry": "CO"
        }
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "COP",
        "value": {
          "@type": "QuantitativeValue",
          "value": vacante.pago_total,
          "unitText": "HOUR"
        }
      }
    };

    const html = `<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${jobUrl}">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- JSON-LD -->
  <script type="application/ld+json">
    ${JSON.stringify(schema)}
  </script>
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Salario: $${vacante.pago_total}</p>
  <p>Lugar: ${vacante.direccion}</p>
  <p><em>Turnes - Conectando Talento Operativo</em></p>
  <script>
    // Redirigir a la SPA real si un humano entra aquí accidentalmente
    window.location.href = "${jobUrl}";
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "public, max-age=3600"
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
