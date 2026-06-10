import { PlusCircle, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import typography from '../../styles/typography';

import { useNavigate } from 'react-router-dom';

/**
 * Header Ultra-Sutil: Escala Senior reducida.
 */
export const DashboardHeader = ({ name, balance, unread }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6 px-1">

      {/* 1. IDENTIDAD: Texto escalado y elegante */}
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
          Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            {name?.split(' ')[0]}
          </span>
        </h1>
      </div>

      {/* 2. SALDO: Widget compacto y alineado */}
      <div
        onClick={() => navigate('/dashboard/finanzas')}
        className="h-12 glass-card px-4 md:px-6 cursor-pointer border-emerald-500/10 hover:border-emerald-500/40 transition-all flex flex-col items-center justify-center shrink-0 no-select shadow-lg"
      >
        <span className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1">
          Saldo
        </span>
        <span className="text-sm md:text-lg font-black text-white tabular-nums leading-none">
          {balance}
        </span>
      </div>

    </header >
  );
};
export default DashboardHeader;
