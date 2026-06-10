import { useNavigate } from 'react-router-dom';

/**
 * RechargeButton
 * Componente atómico y reutilizable para la recarga de saldo.
 * Implementa el diseño Zero-Border premium y animaciones nativas.
 * @param {string} className - Clases adicionales de Tailwind para posicionamiento o visibilidad (ej. 'hidden md:flex').
 */
const RechargeButton = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/dashboard/finanzas/recargar')}
      className={`relative flex items-center justify-center transition-all duration-300 active:scale-95 group shrink-0
        md:h-10 md:text-white md:border md:border-brand-success md:hover:border-white/70 md:bg-brand-primary/90 md:hover:bg-brand-primary md:shadow-md md:shadow-brand-primary/30 md:px-5 md:rounded-xl md:font-bold md:uppercase md:text-[9px] md:tracking-[0.2em] md:gap-2 md:overflow-hidden
        w-9 h-9 rounded-full bg-zinc-900/80 border border-brand-success/40 shadow-[0_0_16px_rgba(16,185,129,0.15)] md:w-auto
        ${className}`}
      title="Recargar Saldo"
    >
      <PlusCircle size={18} className="relative z-10 text-brand-success md:text-white" strokeWidth={2.5} />
      <span className="hidden md:block relative z-10">Recargar Saldo</span>
      <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
    </button>
  );
};

export default RechargeButton;
