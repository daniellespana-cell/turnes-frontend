import React from 'react';
import { Helmet } from 'react-helmet-async';

import { useLocation } from 'react-router-dom';

/**
 * Componente SEOHead: Maneja dinámicamente las etiquetas Meta, Open Graph, Twitter Card y JSON-LD.
 * 
 * @param {string} title - Título de la página (se le añade " | Turnes" automáticamente).
 * @param {string} description - Descripción para motores de búsqueda y redes sociales.
 * @param {string} image - URL de la imagen para compartir (Open Graph).
 * @param {string} type - Tipo de contenido (website, article, profile).
 * @param {object} jsonLd - Objeto JSON-LD para datos estructurados (Google Jobs, Organization, etc).
 */
const SEOHead = ({
    title = "Turnes | Conecta Talento Verificado al Instante",
    description = "La plataforma #1 para encontrar turnos flexibles y contratar personal verificado en tiempo récord. Sin papeleo, pagos inmediatos.",
    image = "https://turnes.app/og-image-default.jpg", // TODO: Reemplazar con URL real de producción
    type = "website",
    jsonLd = null
}) => {
    const { pathname } = useLocation();
    const siteUrl = "https://turnes.app"; // TODO: Configurar variable de entorno
    const currentUrl = `${siteUrl}${pathname}`;
    const fullTitle = title.includes("Turnes") ? title : `${title} | Turnes`;

    return (
        <Helmet>
            {/* --- Standard Meta Tags --- */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* --- Open Graph (Facebook, LinkedIn, WhatsApp) --- */}
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Turnes" />
            <meta property="og:locale" content="es_CO" />

            {/* --- Twitter Card --- */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* --- Google Structured Data (JSON-LD) --- */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEOHead;
