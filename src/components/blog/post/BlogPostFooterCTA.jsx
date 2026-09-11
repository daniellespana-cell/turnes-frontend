import React from 'react';
import { Link } from 'react-router-dom';

const BlogPostFooterCTA = ({ footerCta }) => {
  if (!footerCta) return null;

  return (
    <footer className="py-20 border-t border-zinc-800/80 bg-[#07090c]" aria-label="Llamado a la acción del artículo">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          {footerCta.title}
        </h3>
        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          {footerCta.subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to={footerCta.companyButton.link}
            className="px-8 py-4 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm uppercase tracking-wider transition-all border border-emerald-600/30 shadow-md"
          >
            {footerCta.companyButton.text}
          </Link>
          <Link
            to={footerCta.workerButton.link}
            className="px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider transition-all border border-zinc-700/80"
          >
            {footerCta.workerButton.text}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default BlogPostFooterCTA;
