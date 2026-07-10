import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { typography } from '../../styles/typography';

export const HeaderDetalle = ({ id }) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-row items-center gap-4 md:gap-6 mb-6 md:mb-10 pt-4">
      {/* BOTÓN DE RETROCESO: Estilo Chat (Minimalista y Sutil) */}
      <button
        onClick={() => navigate(-1)}
        className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors group relative shrink-0 rounded-full hover:bg-white/5"
        title="Volver"
        type="button">
        <ArrowLeft
          size={20}
          className="md:size-5 group-hover:-translate-x-0.5 transition-transform duration-300"
        />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className={typography.pageTitle}>
          Mesa de <span className={typography.gradient}>Contratación</span>
        </h1>
      </div>
    </header>
  );
};

export default HeaderDetalle;