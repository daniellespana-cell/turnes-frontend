/**
 * 📚 BLOG SERVICE (Single Source of Truth)
 * Capa de servicio pura para desacoplar la UI de la estructura de datos.
 * Evita que los componentes manipulen directamente arreglos o lógica de persistencia.
 */

import { BLOG_POSTS, BLOG_CATEGORIES } from '../data/blogPosts';

export const blogService = {
  /**
   * Obtiene todos los artículos disponibles.
   * @returns {Array} Lista completa de posts
   */
  getAllPosts() {
    return BLOG_POSTS;
  },

  /**
   * Obtiene el artículo destacado del mes.
   * @returns {Object} Artículo con flag featured o el primero de la lista
   */
  getFeaturedPost() {
    return BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0] || null;
  },

  /**
   * Busca un artículo por su slug único.
   * @param {string} slug
   * @returns {Object|null}
   */
  getPostBySlug(slug) {
    if (!slug) return null;
    return BLOG_POSTS.find(p => p.slug === slug) || null;
  },

  /**
   * Retorna las categorías editoriales del blog.
   * @returns {Array}
   */
  getCategories() {
    return BLOG_CATEGORIES;
  },

  /**
   * Filtra artículos por categoría y término de búsqueda.
   * @param {Object} params
   * @param {string} [params.category='todos']
   * @param {string} [params.query='']
   * @returns {Array}
   */
  filterPosts({ category = 'todos', query = '' } = {}) {
    const cleanQuery = (query || '').trim().toLowerCase();
    
    return BLOG_POSTS.filter(post => {
      const matchesCategory = category === 'todos' || post.category === category;
      
      if (!cleanQuery) return matchesCategory;

      const matchesTitle = post.title?.toLowerCase().includes(cleanQuery);
      const matchesExcerpt = post.excerpt?.toLowerCase().includes(cleanQuery);
      const matchesTags = Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(cleanQuery));

      return matchesCategory && (matchesTitle || matchesExcerpt || matchesTags);
    });
  }
};
