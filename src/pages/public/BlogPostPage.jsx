import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { PATHS } from '../../config/routes.paths';
import { useBlogPost } from '../../hooks/useBlogPost';

import BlogPostBreadcrumb from '../../components/blog/post/BlogPostBreadcrumb';
import BlogPostHeader from '../../components/blog/post/BlogPostHeader';
import BlogPostPerspectiveBar from '../../components/blog/post/BlogPostPerspectiveBar';
import BlogPostSectionRenderer from '../../components/blog/post/BlogPostSectionRenderer';
import BlogPostFooterCTA from '../../components/blog/post/BlogPostFooterCTA';

/**
 * 📄 BlogPostPage (Orquestador Declarativo Ligero)
 * Modularizado, sin código espagueti ni lógica acoplada a BD.
 * Consume useBlogPost (Single Source of Truth).
 */
const BlogPostPage = () => {
  const {
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
  } = useBlogPost();

  if (!post) {
    return (
      <div className="w-full bg-black text-white min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Artículo no encontrado</h1>
        <p className="text-zinc-400 text-base mb-8">El artículo que estás buscando no existe o fue reubicado.</p>
        <Link to={PATHS.PUBLIC.BLOG} className="px-6 py-3 rounded-xl bg-[#047857] text-white font-bold text-sm uppercase tracking-wider">
          Volver al Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="w-full bg-black text-white min-h-screen font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <SEO 
        title={`${post.title} | Turnes`}
        description={post.excerpt}
        url={`https://turnes.co/blog/${post.slug}`}
      />

      <BlogPostBreadcrumb title={post.title} />

      <BlogPostHeader 
        post={post}
        copiedLink={copiedLink}
        onCopyLink={handleCopyLink}
      />

      <BlogPostPerspectiveBar 
        perspective={perspective}
        onPerspectiveChange={handlePerspectiveChange}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-18">
        {visibleSections.map((section, idx) => (
          <BlogPostSectionRenderer
            key={section.id || idx}
            section={section}
            index={idx}
            selectedTemplateTab={selectedTemplateTab}
            onSelectTab={setSelectedTemplateTab}
            copiedTemplateId={copiedTemplateId}
            onCopyTemplate={handleCopyTemplate}
          />
        ))}
      </main>

      <BlogPostFooterCTA footerCta={post.footerCta} />
    </article>
  );
};

export default BlogPostPage;
