import React from 'react';

const BlogSourcesList = ({ sources }) => {
  if (!sources) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
      {sources.map((src, sIdx) => (
        <div key={sIdx} className="bg-[#090b0e] border border-zinc-800 rounded-2xl p-6 space-y-3.5 hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="px-3 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider text-emerald-300">
              {src.badge || 'Fuente Oficial'}
            </span>
            <span className="text-xs sm:text-sm text-zinc-400 font-mono">{src.year || '2024-2026'}</span>
          </div>
          <div>
            <h4 className="font-bold text-white text-base sm:text-lg mb-1">{src.title}</h4>
            <p className="text-emerald-400 font-semibold text-xs sm:text-sm">{src.institution}</p>
          </div>
          <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">{src.description}</p>
          {src.legalBasis && (
            <div className="pt-3 border-t border-zinc-800/80 text-xs sm:text-sm text-zinc-400 font-mono flex items-start gap-2">
              <span className="text-emerald-400">⚖️</span>
              <span>{src.legalBasis}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlogSourcesList;
