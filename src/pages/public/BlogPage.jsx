import React from 'react';
import SEO from '../../components/common/SEO';
import { useBlog } from '../../hooks/useBlog';
import BlogHero from '../../components/blog/BlogHero';
import BlogSearchFilter from '../../components/blog/BlogSearchFilter';
import BlogFeaturedCard from '../../components/blog/BlogFeaturedCard';
import BlogPostCard from '../../components/blog/BlogPostCard';
import BlogEmptyState from '../../components/blog/BlogEmptyState';
import BlogCTA from '../../components/blog/BlogCTA';

/**
 * 📰 BlogPage (Orquestador Declarativo Ligero)
 * Cero lógica de datos o manipulación directa de BD/arreglos.
 * Consume el hook useBlog (Single Source of Truth).
 */
const BlogPage = () => {
  const {
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    featuredPost,
    filteredPosts,
    resetFilters
  } = useBlog();

  const showFeatured = !searchQuery && activeCategory === 'todos' && featuredPost;

  return (
    <div className="w-full bg-black text-white min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <SEO 
        title="Blog & Guías Operativas | Turnes Colombia" 
        description="Aprende a publicar turnos, reducir costes de nómina ociosa y generar ingresos extra en gastronomía, eventos y servicios en Santander y Colombia." 
        url="https://turnes.co/blog"
      />

      <BlogHero />

      <BlogSearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <main className="py-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {showFeatured && <BlogFeaturedCard post={featuredPost} />}

        <section aria-label="Listado de Artículos">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-8">
            {searchQuery ? `Resultados de búsqueda (${filteredPosts.length})` : 'Todos los Artículos y Guías'}
          </h2>

          {filteredPosts.length === 0 ? (
            <BlogEmptyState onReset={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredPosts.map(post => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BlogCTA />
    </div>
  );
};

export default BlogPage;
