import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, UserCheck } from 'lucide-react';
import { PATHS } from '../../../config/routes.paths';

const BlogPostPerspectiveBar = ({ perspective, onPerspectiveChange }) => {
  return (
    <div className="sticky top-16 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800 py-3.5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-zinc-400 font-semibold hidden md:inline-block">Ver contenido adaptado para:</span>
        
        <div className="inline-flex items-center p-1 rounded-xl bg-[#090b0e] border border-zinc-800 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => onPerspectiveChange('all')}
            className={`px-4 py-2 rounded-lg transition-all ${perspective === 'all' ? 'bg-[#047857] text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Artículo Completo
          </button>
          <button
            type="button"
            onClick={() => onPerspectiveChange('empresas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${perspective === 'empresas' ? 'bg-[#047857] text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <Building2 size={15} />
            <span>Para Empresas</span>
          </button>
          <button
            type="button"
            onClick={() => onPerspectiveChange('talento')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${perspective === 'talento' ? 'bg-[#047857] text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <UserCheck size={15} />
            <span>Para Empleados / Talento</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold ml-auto sm:ml-0">
          <Link to={PATHS.PUBLIC.REGISTER_COMPANY} className="text-zinc-400 hover:text-white transition-colors">
            Soy Empresa &rarr;
          </Link>
          <Link to={PATHS.PUBLIC.REGISTER_TALENT} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
            Soy Talento &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPerspectiveBar;
