import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

/**
 * 🚀 SEO Component (Single Source of Truth)
 * 
 * Maneja dinámicamente las etiquetas Meta, Open Graph, Twitter Card y JSON-LD (Structured Data).
 * 
 * @param {string} title - Título de la página (se le añade " | Turnes" automáticamente si no lo tiene).
 * @param {string} description - Descripción para motores de búsqueda y redes sociales.
 * @param {string} image - URL de la imagen para compartir (Open Graph/Twitter).
 * @param {string} type - Tipo de contenido (website, article, profile).
 * @param {object} jsonLd - Objeto JSON-LD para datos estructurados (Google Jobs, Organization, etc).
 */
const SEO = ({
    title = "Turnes | Conecta Talento Verificado al Instante",
    description = "La plataforma #1 para encontrar turnos flexibles y contratar personal verificado en tiempo récord. Sin papeleo, pagos inmediatos.",
    image = import.meta.env.VITE_DEFAULT_OG_IMAGE || "https://turnes.co/turnes-og-logo-v3.jpg",
    type = "website",
    jsonLd = null
}) => {
    const { pathname } = useLocation();
    
    // SSOT del dominio canónico
    const siteUrl = import.meta.env.VITE_SITE_URL || "https://turnes.co";
    const currentUrl = `${siteUrl}${pathname}`;
    const fullTitle = title.includes("Turnes") ? title : `${title} | Turnes`;

    return (
        <Helmet>
            {/* --- Standard Meta Tags --- */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* --- Open Graph (Facebook, LinkedIn, WhatsApp) --- */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={fullTitle} />
            <meta property="og:site_name" content="Turnes" />
            <meta property="og:locale" content="es_CO" />

            {/* --- Twitter / X tags --- */}
            <meta name="twitter:creator" content="@turnes_app" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <meta name="twitter:image:alt" content={fullTitle} />

            {/* --- Google Structured Data (JSON-LD) --- */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
