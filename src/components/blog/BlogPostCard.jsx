import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';

const BlogPostCard = ({ post }) => {
  return (
    <article className="bg-[#090b0e] border border-zinc-800/80 rounded-3xl p-7 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200 shadow-xl group">
      <div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 mb-3.5">
          <span className="font-bold text-emerald-400 uppercase tracking-wider">{post.categoryName}</span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {post.readTime}
          </span>
        </div>

        <Link to={`/blog/${post.slug}`}>
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-3">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed mb-6 font-normal">
          {post.excerpt}
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-800/70 flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-medium">{post.publishDate}</span>
        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>Leer artículo</span>
          <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
};

export default BlogPostCard;
