import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { blogService } from '../services/blog.service';

/**
 * 🪝 useBlogPost Hook
 * Encapsula la lógica de resolución de artículo, perspectiva de audiencia,
 * pestañas de plantillas, copiado seguro y scroll interactivo.
 */
export const useBlogPost = () => {
  const { slug } = useParams();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState(null);
  const [perspective, setPerspective] = useState('all'); // 'all' | 'empresas' | 'talento'
  const [selectedTemplateTab, setSelectedTemplateTab] = useState('mesero');

  const linkTimeoutRef = useRef(null);
  const templateTimeoutRef = useRef(null);

  // Limpieza de timeouts al desmontar para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (linkTimeoutRef.current) clearTimeout(linkTimeoutRef.current);
      if (templateTimeoutRef.current) clearTimeout(templateTimeoutRef.current);
    };
  }, []);

  const post = useMemo(() => {
    return blogService.getPostBySlug(slug) || blogService.getFeaturedPost();
  }, [slug]);

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
    if (newPerspective === 'empresas') {
      const el = document.getElementById('paso-a-paso') || document.getElementById('seccion-0');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (newPerspective === 'talento') {
      const el = document.getElementById('para-talento') || document.getElementById('seccion-0');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return {
    post,
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
