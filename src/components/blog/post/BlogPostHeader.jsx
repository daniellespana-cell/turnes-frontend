import React from 'react';
import { Clock, Copy, Check } from 'lucide-react';

const BlogPostHeader = ({ post, copiedLink, onCopyLink }) => {
  return (
    <header className="pt-12 pb-14 sm:pb-18 border-b border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          <span className="px-3.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
            {post.categoryName}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-sm text-zinc-400 flex items-center gap-1.5">
            <Clock size={15} /> {post.readTime}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-sm text-zinc-400">{post.publishDate}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.14] mb-6">
          {post.title}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 leading-relaxed font-normal mb-10">
          {post.heroSubtitle || post.excerpt}
        </p>

        {/* Autor y Compartir */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-12 h-12 rounded-full object-cover border border-emerald-500/30 shadow-md"
            />
            <div>
              <p className="text-sm sm:text-base font-bold text-white">{post.author.name}</p>
              <p className="text-xs sm:text-sm text-zinc-400">{post.author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#090b0e] border border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              title="Copiar enlace del artículo"
            >
              {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              <span>{copiedLink ? '¡Copiado!' : 'Copiar link'}</span>
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#090b0e] border border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#090b0e] border border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>

      </div>
    </header>
  );
};

export default BlogPostHeader;
