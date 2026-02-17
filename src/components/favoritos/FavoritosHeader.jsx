import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { typography } from '../../styles/typography';

const FavoritosHeader = ({ onBack, count }) => {
  return (
    <header className="flex items-center gap-6 mb-12">
      <button
        onClick={onBack}
        className="p-2 -ml-2 text-zinc-500 hover:text-white transition-all active:scale-95 group rounded-full hover:bg-white/5"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
      </button>

      <div className="space-y-0.5">
        <h1 className={typography.pageTitle}>
          Mis <span className={typography.gradient}>Favoritos</span>
        </h1>
        <div className="flex items-center gap-2">
          <p className={typography.sectionTitle}>
            Recontrata a tus elegidos, <span className="text-zinc-400 font-normal normal-case tracking-normal">más rápido</span>
          </p>
          {count > 0 && (
            <span className="bg-zinc-800 text-zinc-400 text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-white/5">
              {count}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default FavoritosHeader;