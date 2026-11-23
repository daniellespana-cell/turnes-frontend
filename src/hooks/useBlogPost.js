import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { blogService } from '../services/blog.service';
import { BLOG_POSTS } from '../data/blogPosts';
import { normalizeBlogPost } from '../domain/blog.mapper';

/**
 * 🪝 useBlogPost Hook
 * Encapsula la lógica de resolución de artículo, perspectiva de audiencia,
 * pestañas de plantillas, copiado seguro y sincronización con Supabase.
 */
export const useBlogPost = () => {
  const { slug } = useParams();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState(null);
  const [perspective, setPerspective] = useState('all'); // 'all' | 'empresas' | 'talento'
  const [selectedTemplateTab, setSelectedTemplateTab] = useState('mesero');

  // Inicialización instantánea con fallback local (0ms TBT)
  const [post, setPost] = useState(() => {
    const local = BLOG_POSTS.find(p => p.slug === slug);
    return local ? normalizeBlogPost(local) : null;
  });
  const [loading, setLoading] = useState(false);

  const linkTimeoutRef = useRef(null);
  const templateTimeoutRef = useRef(null);

  // Sincronización con Supabase por si el artículo es nuevo o fue editado en admin
  useEffect(() => {
    let isMounted = true;
    const fetchLivePost = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const resolved = await blogService.getPostBySlug(slug);
        if (isMounted && resolved) {
          setPost(resolved);
        }
      } catch (err) {
        console.warn('[useBlogPost] Error cargando post de Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLivePost();
    return () => { isMounted = false; };
  }, [slug]);

  // Limpieza de timeouts al desmontar para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
      if (templateTimeoutRef.current) clearTimeout(templateTimeoutRef.current);
    };
  }, []);

  // Filtrado de secciones según perspectiva
  const visibleSections = useMemo(() => {
    if (!post || !post.sections) return [];
    return post.sections.filter(section => {
      if (perspective === 'all') return true;
      if (perspective === 'empresas') return section.audience !== 'talento';
      if (perspective === 'talento') return section.audience !== 'empresas';
      return true;
    });
  }, [post, perspective]);

  const handleCopyLink = useCallback(() => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
      linkTimeoutRef.current = setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Error al copiar link:', err);
    }
  }, []);

  const handleCopyTemplate = useCallback((templateId, text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedTemplateId(templateId);
      if (templateTimeoutRef.current) clearTimeout(templateTimeoutRef.current);
      templateTimeoutRef.current = setTimeout(() => setCopiedTemplateId(null), 2500);
    } catch (err) {
      console.error('Error al copiar plantilla:', err);
    }
  }, []);

  const handlePerspectiveChange = useCallback((newPerspective) => {
    setPerspective(newPerspective);
  }, []);

  return {
    post,
    loading,
    visibleSections,
    perspective,
    handlePerspectiveChange,
    selectedTemplateTab,
    setSelectedTemplateTab,
    copiedLink,
    handleCopyLink,
    copiedTemplateId,
    handleCopyTemplate
  };
};
