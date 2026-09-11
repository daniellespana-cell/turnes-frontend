import React from 'react';
import { Search } from 'lucide-react';

const BlogSearchFilter = ({ searchQuery, setSearchQuery, categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
      {/* Buscador Rápido */}
      <div className="max-w-lg mx-auto relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por rol, tema (mesero, tarifas, costos)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar artículos en el blog"
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#090b0e] border border-zinc-800 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 transition-colors shadow-2xl"
        />
      </div>

      {/* Categorías */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#047857] text-white border border-emerald-600/40 shadow-sm'
                : 'bg-[#090b0e] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BlogSearchFilter;
