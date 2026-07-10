import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { typography } from '../../styles/typography';

const Header = ({ onBack }) => {
  return (
    <header className="flex items-center gap-6 mb-8 pt-4">
      {/* BOTÓN DE RETROCESO (Minimalista) */}
      <button
        onClick={onBack}
        className="p-2 -ml-2 text-zinc-500 hover:text-white transition-all active:scale-95 group flex items-center justify-center rounded-full hover:bg-white/5"
        type="button"
        aria-label="Acción">
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
      </button>
      {/* TÍTULOS ESTRATÉGICOS CON TYPOGRAPHY */}
      <div className="space-y-0.5">
        <h1 className={typography.pageTitle}>
          <span className={typography.gradient}>
            Publicar Vacante
          </span>
        </h1>

        <p className={typography.sectionTitle}>
          Proceso de creación paso a paso
        </p>
      </div>
    </header>
  );
};

export default Header;