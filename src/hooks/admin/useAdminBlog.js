import { useState, useEffect, useCallback } from 'react';
import { blogService } from '../../services/blog.service';
import { slugify, validateBlogPost } from '../../domain/blog.mapper';
import { toast } from 'sonner';

const EMPTY_POST_TEMPLATE = {
  id: null,
  title: '',
  slug: '',
  excerpt: '',
  category: 'empresas',
  coverUrl: null,
  featured: false,
  tags: [],
  status: 'published',
  sections: [
    {
      id: 'seccion-1',
      title: 'Introducción y Contexto',
      paragraphs: ['Escribe aquí el primer párrafo de tu artículo.'],
      callout: null
    }
  ]
};

/**
 * 🪝 useAdminBlog Hook
 * Encapsula toda la lógica de gestión de artículos para el panel de administración.
 * Cero llamadas directas a Supabase desde la UI (Single Source of Truth).
 */
export const useAdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await blogService.adminGetPosts();
      if (error) {
        toast.error('No se pudieron sincronizar todos los artículos.');
      }
      setPosts(data || []);
    } catch (err) {
      console.error('[useAdminBlog.fetchPosts] Error:', err);
      toast.error('Error de conexión al cargar artículos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Iniciar nuevo artículo
  const startNewPost = useCallback(() => {
    setActivePost({
      ...EMPTY_POST_TEMPLATE,
      id: null,
      sections: [
        {
          id: 'seccion-1',
          title: 'Introducción y Contexto',
          paragraphs: [''],
          callout: null
        }
      ]
    });
    setIsEditing(true);
  }, []);

  // Editar artículo existente
  const startEditPost = useCallback((post) => {
    setActivePost({
      ...post,
      sections: Array.isArray(post.sections) && post.sections.length > 0 
        ? post.sections 
        : [{ id: 'seccion-1', title: 'Contenido Principal', paragraphs: [''], callout: null }]
    });
    setIsEditing(true);
  }, []);

  // Cancelar edición
  const cancelEdit = useCallback(() => {
    setActivePost(null);
    setIsEditing(false);
  }, []);

  // Actualizar campo de nivel superior
  const updateField = useCallback((field, value) => {
    setActivePost(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      // Auto-generar slug si el usuario edita el título y el post es nuevo
      if (field === 'title' && !prev.id) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }, []);

  // Subida y auto-compresión de portada
  const handleCoverUpload = useCallback(async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url, error } = await blogService.adminUploadCover(file);
      if (error) {
        toast.error(`Error al subir la imagen: ${error}`);
        return;
      }
      if (url) {
        setActivePost(prev => prev ? { ...prev, coverUrl: url } : null);
        toast.success('Portada optimizada y cargada en WebP.');
      }
    } catch (err) {
      console.error('[useAdminBlog.handleCoverUpload]', err);
      toast.error('Error al procesar la portada.');
    } finally {
      setUploading(false);
    }
  }, []);

  // ─── GESTIÓN DE SECCIONES DE CONTENIDO ────────────────────────────────────

  const addSection = useCallback(() => {
    setActivePost(prev => {
      if (!prev) return null;
      const newIndex = (prev.sections?.length || 0) + 1;
      const newSection = {
        id: `seccion-${Date.now()}`,
        title: `Subtítulo ${newIndex}`,
        paragraphs: [''],
        callout: null
      };
      return {
        ...prev,
        sections: [...(prev.sections || []), newSection]
      };
    });
  }, []);

  const updateSectionTitle = useCallback((sectionIndex, title) => {
    setActivePost(prev => {
      if (!prev) return null;
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        title
      };
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const updateParagraph = useCallback((sectionIndex, paragraphIndex, text) => {
    setActivePost(prev => {
      if (!prev) return null;
      const updatedSections = [...prev.sections];
      const section = { ...updatedSections[sectionIndex] };
      const paragraphs = [...(section.paragraphs || [])];
      paragraphs[paragraphIndex] = text;
      section.paragraphs = paragraphs;
      updatedSections[sectionIndex] = section;
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const addParagraphToSection = useCallback((sectionIndex) => {
    setActivePost(prev => {
      if (!prev) return null;
      const updatedSections = [...prev.sections];
      const section = { ...updatedSections[sectionIndex] };
      section.paragraphs = [...(section.paragraphs || []), ''];
      updatedSections[sectionIndex] = section;
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const removeParagraphFromSection = useCallback((sectionIndex, paragraphIndex) => {
    setActivePost(prev => {
      if (!prev) return null;
      const updatedSections = [...prev.sections];
      const section = { ...updatedSections[sectionIndex] };
      section.paragraphs = (section.paragraphs || []).filter((_, i) => i !== paragraphIndex);
      if (section.paragraphs.length === 0) section.paragraphs = [''];
      updatedSections[sectionIndex] = section;
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const toggleCallout = useCallback((sectionIndex) => {
    setActivePost(prev => {
      if (!prev) return null;
      const updatedSections = [...prev.sections];
      const section = { ...updatedSections[sectionIndex] };
      if (section.callout) {
        section.callout = null;
      } else {
        section.callout = {
          badge: 'Consejo para Operaciones',
          text: ''
        };
      }
      updatedSections[sectionIndex] = section;
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const updateCallout = useCallback((sectionIndex, field, value) => {
    setActivePost(prev => {
      if (!prev) return null;
      const updatedSections = [...prev.sections];
      const section = { ...updatedSections[sectionIndex] };
      if (!section.callout) return prev;
      section.callout = { ...section.callout, [field]: value };
      updatedSections[sectionIndex] = section;
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const removeSection = useCallback((sectionIndex) => {
    setActivePost(prev => {
      if (!prev) return null;
      if (prev.sections.length <= 1) {
        toast.warning('El artículo debe tener al menos una sección.');
        return prev;
      }
      const updatedSections = prev.sections.filter((_, i) => i !== sectionIndex);
      return { ...prev, sections: updatedSections };
    });
  }, []);

  // ─── GUARDADO Y PUBLICACIÓN ────────────────────────────────────────────────

  const savePost = useCallback(async () => {
    if (!activePost) return;

    const validation = validateBlogPost(activePost);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSaving(true);
    try {
      if (activePost.id) {
        // Actualización
        const { error } = await blogService.adminUpdatePost(activePost.id, activePost);
        if (error) throw error;
        toast.success('Artículo actualizado exitosamente.');
      } else {
        // Creación
        const { error } = await blogService.adminCreatePost(activePost);
        if (error) throw error;
        toast.success('Artículo publicado exitosamente.');
      }

      setIsEditing(false);
      setActivePost(null);
      await fetchPosts();
    } catch (err) {
      console.error('[useAdminBlog.savePost]', err);
      toast.error(err.message || 'Error al guardar el artículo.');
    } finally {
      setSaving(false);
    }
  }, [activePost, fetchPosts]);

  // ─── ELIMINACIÓN ───────────────────────────────────────────────────────────

  const deletePost = useCallback(async (id) => {
    if (!id) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { success, error } = await blogService.adminDeletePost(id);
      if (!success || error) throw error;
      toast.success('Artículo eliminado.');
      await fetchPosts();
    } catch (err) {
      console.error('[useAdminBlog.deletePost]', err);
      toast.error('No se pudo eliminar el artículo.');
    }
  }, [fetchPosts]);

  return {
    posts,
    loading,
    saving,
    uploading,
    activePost,
    isEditing,
    startNewPost,
    startEditPost,
    cancelEdit,
    updateField,
    handleCoverUpload,
    addSection,
    updateSectionTitle,
    updateParagraph,
    addParagraphToSection,
    removeParagraphFromSection,
    toggleCallout,
    updateCallout,
    removeSection,
    savePost,
    deletePost
  };
};
