/**
 * 📰 BLOG DOMAIN MAPPER (Single Source of Truth)
 * Transforma y sanitiza datos de blogs entre PostgreSQL y la UI.
 * Funciones puras, sin efectos secundarios ni dependencias de BD.
 */

export const BLOG_CATEGORIES_CONFIG = [
  { id: 'todos', name: 'Todos los Artículos' },
  { id: 'talento', name: 'Para Colaboradores y Extras' },
  { id: 'empresas', name: 'Para Empresas y Negocios' },
  { id: 'guias', name: 'Guías y Tarifas' },
];

/**
 * Convierte un título en un slug SEO limpio y seguro.
 * Ej: "Cómo conseguir turnos en Bucaramanga!" -> "como-conseguir-turnos-en-bucaramanga"
 * @param {string} text 
 * @returns {string}
 */
export const slugify = (text = '') => {
  if (!text || typeof text !== 'string') return '';

  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres con tildes
    .replace(/[\u0300-\u036f]/g, '') // Remueve tildes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remueve caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Guiones repetidos a uno solo
    .replace(/^-+|-+$/g, ''); // Quita guiones al inicio o final
};

/**
 * Calcula el tiempo estimado de lectura a partir de las secciones.
 * Basado en el estándar de 200 palabras por minuto.
 * @param {Array} sections 
 * @returns {string}
 */
export const calculateReadTime = (sections = []) => {
  if (!Array.isArray(sections) || sections.length === 0) return '3 min de lectura';

  let totalWords = 0;
  sections.forEach(section => {
    if (section.title) totalWords += section.title.split(/\s+/).length;
    if (section.description) totalWords += section.description.split(/\s+/).length;
    if (Array.isArray(section.paragraphs)) {
      section.paragraphs.forEach(p => {
        if (typeof p === 'string') totalWords += p.split(/\s+/).length;
      });
    }
  });

  const minutes = Math.max(1, Math.ceil(totalWords / 200));
  return `${minutes} min de lectura`;
};

/**
 * Normaliza un registro de base de datos al formato que espera la UI de Turnes.
 * @param {Object} raw 
 * @returns {Object|null}
 */
export const normalizeBlogPost = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const defaultAuthor = {
    name: 'Equipo Editorial Turnes',
    role: 'Especialistas en Operaciones & Talento Bajo Demanda',
    avatar: '/avatar-carlos.webp'
  };

  const categoryMatch = BLOG_CATEGORIES_CONFIG.find(c => c.id === raw.category);
  const categoryName = raw.category_name || categoryMatch?.name || 'Artículos y Guías';

  return {
    id: raw.id,
    slug: raw.slug || '',
    title: raw.title || 'Artículo sin título',
    excerpt: raw.excerpt || '',
    category: raw.category || 'todos',
    categoryName,
    readTime: raw.read_time || calculateReadTime(raw.sections),
    publishDate: raw.publish_date || new Date(raw.created_at || Date.now()).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    author: raw.author && typeof raw.author === 'object' ? raw.author : defaultAuthor,
    featured: Boolean(raw.featured),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    heroSubtitle: raw.hero_subtitle || raw.excerpt || '',
    coverUrl: raw.cover_url || null,
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    status: raw.status || 'published',
    viewsCount: Number(raw.views_count || 0),
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null
  };
};

/**
 * Valida si los datos mínimos de un artículo están listos para ser guardados.
 * @param {Object} data 
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateBlogPost = (data) => {
  if (!data.title || !data.title.trim()) {
    return { isValid: false, error: 'El título del artículo es obligatorio.' };
  }
  if (!data.excerpt || !data.excerpt.trim()) {
    return { isValid: false, error: 'El resumen o introducción es obligatorio.' };
  }
  if (!data.category || data.category === 'todos') {
    return { isValid: false, error: 'Debes seleccionar una categoría válida (Empresas, Talento o Guías).' };
  }
  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    return { isValid: false, error: 'El artículo debe tener al menos una sección con contenido.' };
  }
  return { isValid: true, error: null };
};
