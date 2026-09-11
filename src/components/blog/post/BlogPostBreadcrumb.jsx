import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PATHS } from '../../../config/routes.paths';

const BlogPostBreadcrumb = ({ title }) => {
  return (
    <div className="border-b border-zinc-800/80 bg-[#07090c]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <Link to={PATHS.PUBLIC.BLOG} className="hover:text-white transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium truncate max-w-[220px] sm:max-w-md">{title}</span>
        </div>
        <Link to={PATHS.PUBLIC.BLOG} className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
          <ArrowLeft size={16} />
          <span>Volver al Blog</span>
        </Link>
      </div>
    </div>
  );
};

export default BlogPostBreadcrumb;
