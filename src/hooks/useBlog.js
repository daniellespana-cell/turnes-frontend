import { useState, useMemo, useCallback } from 'react';
import { blogService } from '../services/blog.service';

/**
 * 🪝 useBlog Hook
 * Encapsula la lógica de estado, búsqueda, filtrado por categorías y datos del blog.
 */
export const useBlog = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => blogService.getCategories(), []);
  const featuredPost = useMemo(() => blogService.getFeaturedPost(), []);

  const filteredPosts = useMemo(() => {
    return blogService.filterPosts({
      category: activeCategory,
      query: searchQuery
    });
  }, [activeCategory, searchQuery]);

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
    resetFilters
  };
};
