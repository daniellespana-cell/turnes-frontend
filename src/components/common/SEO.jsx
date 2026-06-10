import React from 'react';
import { Helmet } from 'react-helmet-async';


/**
 * Componente SEO Reutilizable (Single Source of Truth para Metadatos)
 * No habla con la base de datos, recibe props estáticas o dinámicas de su página padre.
 */
const SEO = ({ 
    title, 
    description, 
    name = "Turnes", 
    type = "website",
    url = "https://turnes.co",
    image = "https://turnes.co/logo192.png" 
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            
            {/* Canonical URL to prevent duplicate content issues */}
            <link rel="canonical" href={url} />

            {/* Facebook / Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={name} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content="@turnes_app" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
