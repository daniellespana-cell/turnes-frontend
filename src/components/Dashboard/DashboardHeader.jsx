import { PlusCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { typography } from '../../styles/typography';

/**
 * Header Ultra-Sutil: Escala Senior reducida.
 */
export const DashboardHeader = ({ name, balance, unread }) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-white/5 pb-6 px-1">

      {/* 1. IDENTIDAD COMPACTA */}
      <div className="space-y-0.5">
        <h1 className={typography.pageTitle}>
          Hola, <span className={typography.gradient}>
            {name?.split(' ')[0]}
          </span>
        </h1>
        <p className={typography.sectionTitle + " antialiased opacity-60"}>
          Ecosistema Turnes v4.0
        </p>
      </div>

      {/* 2. ACCIONES RÁPIDAS (Micro-escala) */}
      <div className="flex items-center gap-3">

        {/* Widget Saldo Minimalista */}
        <div
          onClick={() => navigate('/dashboard/finanzas')}
          className="h-10 bg-zinc-900/30 border border-white/5 px-4 rounded-xl cursor-pointer hover:border-emerald-500/20 transition-all flex flex-col items-end justify-center group"
        >
          <span className="text-[6px] font-bold text-zinc-700 uppercase tracking-widest leading-none mb-0.5">
            Disponible
          </span>
          <span className="text-sm font-bold text-white tabular-nums leading-none">
            {balance}
          </span>
        </div>



        {/* Botón de Acción Principal Slim */}
        {/* Botón de Acción Principal Slim - Estilo Navbar Replicado */}
        <button
          onClick={() => navigate('/dashboard/vacantes/crear')}
          className="h-10 text-white border border-brand-success hover:border-white/70 bg-brand-primary/90 hover:bg-brand-primary shadow-md shadow-brand-primary/30 px-5 rounded-xl font-bold uppercase text-[9px] tracking-[0.2em] active:scale-95 transition-all flex items-center gap-2 relative overflow-hidden group"
        >
          <PlusCircle size={18} className="relative z-10" />
          <span className="relative z-10">Nueva Vacante</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
        </button>
      </div>
    </header >
  );
};