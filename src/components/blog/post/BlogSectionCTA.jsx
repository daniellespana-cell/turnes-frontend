import React from 'react';
import { Link } from 'react-router-dom';

const BlogSectionCTA = ({ cta }) => {
  if (!cta) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#090b0e] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-5 mt-8">
      <div>
        <h4 className="text-base sm:text-lg font-bold text-white">{cta.title}</h4>
        <p className="text-sm text-zinc-400 mt-1">{cta.subtitle}</p>
      </div>
      <Link
        to={cta.buttonLink}
        className="px-6 py-3.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-sm uppercase tracking-wider shrink-0 transition-all shadow-sm"
      >
        {cta.buttonText} &rarr;
      </Link>
    </div>
  );
};

export default BlogSectionCTA;
