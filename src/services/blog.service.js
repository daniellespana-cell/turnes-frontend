/**
 * 📚 BLOG SERVICE (Single Source of Truth & CQRS)
 * Capa de servicio pura para desacoplar la UI de Supabase y el almacenamiento.
 * Provee métodos públicos de lectura y métodos protegidos para el panel de administración.
 */

import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { BLOG_POSTS } from '../data/blogPosts';
import { 
  normalizeBlogPost, 
  BLOG_CATEGORIES_CONFIG, 
  slugify, 
  calculateReadTime,
  validateBlogPost 
} from '../domain/blog.mapper';
import { compressBlogCover } from '../utils/imageUtils';

export const blogService = {
  /**
   * Obtiene todos los artículos publicados.
   * Con fallback defensivo al repositorio estático en caso de desconexión.
   * @returns {Promise<Array>}
   */
  async getAllPosts() {
    try {
      const query = supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      const { data, error } = await BaseService.handle(query, 10000, 'blogService.getAllPosts');

      if (error || !data || data.length === 0) {
        // Fallback defensivo a los posts estáticos locales para asegurar disponibilidad 100%
        return BLOG_POSTS.map(normalizeBlogPost).filter(Boolean);
      }

      return data.map(normalizeBlogPost).filter(Boolean);
    } catch (err) {
      console.warn('[blogService.getAllPosts] Fallback local activo:', err);
      return BLOG_POSTS.map(normalizeBlogPost).filter(Boolean);
    }
  },

  /**
   * Obtiene el artículo destacado del blog.
   * @returns {Promise<Object|null>}
   */
  async getFeaturedPost() {
    const posts = await this.getAllPosts();
    return posts.find(p => p.featured) || posts[0] || null;
  },

  /**
   * Busca un artículo por su slug único.
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  async getPostBySlug(slug) {
    if (!slug) return null;

    try {
      const query = supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      const { data, error } = await BaseService.handle(query, 8000, 'blogService.getPostBySlug');

      if (error || !data) {
        // Fallback defensivo al post estático
        const local = BLOG_POSTS.find(p => p.slug === slug);
        return local ? normalizeBlogPost(local) : null;
      }

      return normalizeBlogPost(data);
    } catch (err) {
      console.warn('[blogService.getPostBySlug] Fallback local activo:', err);
      const local = BLOG_POSTS.find(p => p.slug === slug);
      return local ? normalizeBlogPost(local) : null;
    }
  },

  /**
   * Retorna las categorías editoriales.
   */
  getCategories() {
    return BLOG_CATEGORIES_CONFIG;
  },

  /**
   * Filtra una lista de artículos por categoría y término de búsqueda.
   * @param {Array} posts
   * @param {Object} params
   * @returns {Array}
   */
  filterPostsList(posts = [], { category = 'todos', query = '' } = {}) {
    const cleanQuery = (query || '').trim().toLowerCase();

    return posts.filter(post => {
      const matchesCategory = category === 'todos' || post.category === category;
      if (!cleanQuery) return matchesCategory;

      const matchesTitle = post.title?.toLowerCase().includes(cleanQuery);
      const matchesExcerpt = post.excerpt?.toLowerCase().includes(cleanQuery);
      const matchesTags = Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(cleanQuery));

      return matchesCategory && (matchesTitle || matchesExcerpt || matchesTags);
    });
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 🛡️ MÉTODOS DE ADMINISTRACIÓN (Protegidos por RLS)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Obtiene todos los artículos para el panel de administración (incluyendo borradores).
   * @returns {Promise<{ data: Array, error: any }>}
   */
  async adminGetPosts() {
    const query = supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = await BaseService.handle(query, 12000, 'blogService.adminGetPosts');

    if (error) {
      return { data: BLOG_POSTS.map(normalizeBlogPost).filter(Boolean), error };
    }

    return { 
      data: (data || []).map(normalizeBlogPost).filter(Boolean), 
      error: null 
    };
  },

  /**
   * Comprime y sube una foto de portada al bucket 'blog-covers'.
   * @param {File} file - Archivo seleccionado por el editor
   * @returns {Promise<{ url: string|null, error: any }>}
   */
  async adminUploadCover(file) {
    if (!file) return { url: null, error: 'No se seleccionó ningún archivo' };

    try {
      // 1. Compresión automática a WebP en el navegador (15MB -> ~120KB)
      const compressedBlob = await compressBlogCover(file);

      // 2. Nombre de archivo único y seguro
      const fileExt = 'webp';
      const fileName = `cover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // 3. Subida a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog-covers')
        .upload(filePath, compressedBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 4. Obtención de URL pública
      const { data: publicData } = supabase.storage
        .from('blog-covers')
        .getPublicUrl(filePath);

      return { url: publicData?.publicUrl || null, error: null };
    } catch (err) {
      console.error('[blogService.adminUploadCover] Error:', err);
      return { url: null, error: err.message || 'Error al subir la imagen' };
    }
  },

  /**
   * Crea un nuevo artículo en la base de datos.
   * @param {Object} postData
   * @returns {Promise<{ data: any, error: any }>}
   */
  async adminCreatePost(postData) {
    const validation = validateBlogPost(postData);
    if (!validation.isValid) {
      return { data: null, error: { message: validation.error } };
    }

    const safeSlug = slugify(postData.slug || postData.title);
    const readTime = calculateReadTime(postData.sections);

    const payload = {
      slug: safeSlug,
      title: postData.title.trim(),
      excerpt: postData.excerpt.trim(),
      category: postData.category,
      category_name: BLOG_CATEGORIES_CONFIG.find(c => c.id === postData.category)?.name || 'Artículos y Guías',
      read_time: readTime,
      publish_date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: postData.author || {
        name: 'Equipo Editorial Turnes',
        role: 'Especialistas en Operaciones & Talento Bajo Demanda',
        avatar: '/avatar-carlos.webp'
      },
      featured: Boolean(postData.featured),
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      hero_subtitle: (postData.heroSubtitle || postData.excerpt || '').trim(),
      cover_url: postData.coverUrl || null,
      sections: Array.isArray(postData.sections) ? postData.sections : [],
      status: postData.status || 'published'
    };

    const query = supabase
      .from('blogs')
      .insert(payload)
      .select()
      .single();

    return await BaseService.handle(query, 10000, 'blogService.adminCreatePost');
  },

  /**
   * Actualiza un artículo existente.
   * @param {string} id
   * @param {Object} postData
   * @returns {Promise<{ data: any, error: any }>}
   */
  async adminUpdatePost(id, postData) {
    if (!id) return { data: null, error: { message: 'ID del artículo requerido' } };

    const validation = validateBlogPost(postData);
    if (!validation.isValid) {
      return { data: null, error: { message: validation.error } };
    }

    const safeSlug = slugify(postData.slug || postData.title);
    const readTime = calculateReadTime(postData.sections);

    const payload = {
      slug: safeSlug,
      title: postData.title.trim(),
      excerpt: postData.excerpt.trim(),
      category: postData.category,
      category_name: BLOG_CATEGORIES_CONFIG.find(c => c.id === postData.category)?.name || 'Artículos y Guías',
      read_time: readTime,
      featured: Boolean(postData.featured),
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      hero_subtitle: (postData.heroSubtitle || postData.excerpt || '').trim(),
      cover_url: postData.coverUrl || null,
      sections: Array.isArray(postData.sections) ? postData.sections : [],
      status: postData.status || 'published',
      updated_at: new Date().toISOString()
    };

    const query = supabase
      .from('blogs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    return await BaseService.handle(query, 10000, 'blogService.adminUpdatePost');
  },

  /**
   * Elimina un artículo por su ID.
   * @param {string} id
   * @returns {Promise<{ success: boolean, error: any }>}
   */
  async adminDeletePost(id) {
    if (!id) return { success: false, error: 'ID requerido' };

    const query = supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    const { error } = await BaseService.handle(query, 10000, 'blogService.adminDeletePost');
    return { success: !error, error };
  }
};
