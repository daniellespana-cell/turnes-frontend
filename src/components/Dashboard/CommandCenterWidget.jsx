import React from 'react';
import { m as motion } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

const CommandCenterWidget = ({ activeProcess, hasUrgentAction, onNavigate }) => {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative"
    >
      {hasUrgentAction && (
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse z-0" />
      )}

      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`border rounded-3xl p-6 relative overflow-hidden cursor-pointer z-10 transition-all duration-500
          ${hasUrgentAction
            ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border-indigo-400/30 shadow-[0_10px_40px_rgba(99,102,241,0.2)]'
            : 'bg-gradient-to-br from-emerald-600/10 to-teal-600/5 border-emerald-500/20 shadow-[0_10px_40px_rgba(52,211,153,0.1)]'
          }`}
        onClick={onNavigate}
      >
        <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl transition-all ${hasUrgentAction ? 'bg-indigo-500/30' : 'bg-emerald-500/20'}`} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-4 relative z-10">
          <div className="flex gap-4 items-start w-full">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner
              ${hasUrgentAction ? 'bg-indigo-500/30 border-indigo-400/50' : 'bg-emerald-500/20 border-emerald-400/30'}
            `}>
              <CheckCircle2 size={24} className="text-white drop-shadow-md" />
            </div>
            <div className="flex-1">
              <span className={`text-[10px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 block ${hasUrgentAction ? 'text-indigo-300' : 'text-emerald-400'}`}>
                {hasUrgentAction ? 'Acción Requerida' : 'Ecosistema Optimizado'}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight mb-1">{activeProcess.title}</h3>
              <p className={`text-[11px] sm:text-xs font-medium ${hasUrgentAction ? 'text-indigo-200/80' : 'text-emerald-200/60'}`}>{activeProcess.meta}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            className={`flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0
              ${hasUrgentAction
                ? 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
              }
            `}
          >
            {hasUrgentAction ? 'Resolver' : 'Explorar'} <ChevronRight size={14} strokeWidth={3} />
          </motion.button>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default CommandCenterWidget;
