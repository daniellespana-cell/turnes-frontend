import { useState, useMemo, useCallback, useEffect } from 'react';
import { blogService } from '../services/blog.service';
import { BLOG_POSTS } from '../data/blogPosts';
import { normalizeBlogPost } from '../domain/blog.mapper';

/**
 * 🪝 useBlog Hook
 * Encapsula la lógica de estado, búsqueda, filtrado por categorías y datos del blog.
 * Estrategia Stale-While-Revalidate: Carga síncrona instantánea (0ms LCP) y sincronización con Supabase.
 */
export const useBlog = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  // Carga inicial instantánea con datos locales para 0 layout shift
  const [posts, setPosts] = useState(() => BLOG_POSTS.map(normalizeBlogPost).filter(Boolean));
  const [loading, setLoading] = useState(false);

  // Sincronización asíncrona con Supabase en background
  useEffect(() => {
    let isMounted = true;
    const fetchLivePosts = async () => {
      try {
        setLoading(true);
        const livePosts = await blogService.getAllPosts();
        if (isMounted && Array.isArray(livePosts) && livePosts.length > 0) {
          setPosts(livePosts);
        }
      } catch (err) {
        console.warn('[useBlog] Error sincronizando posts en vivo:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLivePosts();
    return () => { isMounted = false; };
  }, []);

  const categories = useMemo(() => blogService.getCategories(), []);
  
  const featuredPost = useMemo(() => {
    return posts.find(p => p.featured) || posts[0] || null;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return blogService.filterPostsList(posts, {
      category: activeCategory,
      query: searchQuery
    });
  }, [posts, activeCategory, searchQuery]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('todos');
  }, []);

  return {
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    featuredPost,
    filteredPosts,
    resetFilters,
    loading
  };
};
