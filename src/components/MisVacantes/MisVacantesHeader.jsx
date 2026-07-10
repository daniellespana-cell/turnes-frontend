import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

// Importamos tu sistema de tipografía
import { typography } from '../../styles/typography';

const MisVacantesHeader = ({ userPlan, filteredCount, onBack, onCreate }) => (
  <header className="flex flex-col md:flex-row md:items-center gap-6 mb-12 pt-4 md:pt-8 font-manrope">

    <div className="flex items-center gap-6 flex-1">
      <button
        onClick={onBack}
        className="p-2 -ml-2 text-zinc-500 hover:text-white transition-all active:scale-95 group rounded-full hover:bg-white/5"
        type="button"
        aria-label="Acción">
        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <div className="space-y-1">
        <h1 className={`${typography.pageTitle} text-3xl md:text-4xl text-left`}>
          <span className={typography.gradient}>
            Mis Vacantes
          </span>
        </h1>

        <p className={typography.sectionTitle}>
          {filteredCount === 0
            ? "Comienza a expandir tu equipo hoy"
            : `Tienes ${filteredCount} procesos en marcha ahora`}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t border-white/5 pt-4 md:border-none md:pt-0">

      {/* Minimal Plan Badge */}
      <div className="flex flex-col items-end">
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Plan Actual</span>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${userPlan?.toUpperCase() === 'PRO' ? 'text-emerald-500' : 'text-zinc-400'
          }`}>
          {userPlan || 'Básico'}
        </span>
      </div>

      <div className="h-8 w-px bg-white/5 hidden md:block" />

      {/* Primary Action - Clean & Shimmering */}
      <button
        onClick={onCreate}
        className="group relative flex items-center gap-2 bg-brand-primary/90 hover:bg-brand-primary border border-brand-success/50 hover:border-brand-success text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 overflow-hidden shadow-lg shadow-brand-primary/20"
        type="button"
        aria-label="Acción">
        <Plus size={14} strokeWidth={3} className="relative z-10" />
        <span className="relative z-10">Crear Vacante</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
      </button>
    </div>
  </header>
);

export default MisVacantesHeader;