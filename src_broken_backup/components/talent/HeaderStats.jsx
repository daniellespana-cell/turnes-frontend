import { useNavigate } from 'react-router-dom';
import { typography } from '../../styles/typography';

const HeaderStats = ({ score = "5.0" }) => {
  const navigate = useNavigate();
  const displayScore = typeof score === 'number' ? score.toFixed(1) : score;

  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto gap-6 border-b border-white/5 pb-8">

      <div className="flex items-center gap-3">
        {/* BOTÓN ATRÁS - Más pequeño y sutil */}
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-zinc-500 hover:text-white transition-all active:scale-95 group shrink-0 rounded-full hover:bg-white/5"
        >
          <ArrowLeft size={20} />
        </button>

        {/* SECCIÓN TÍTULO - Escala sutil */}
        <div className="space-y-0.5">
          <h1 className={typography.pageTitle}>
            <span className={typography.gradient}>
              Red de Confianza
            </span>
          </h1>

          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-500" />
            <p className={typography.sectionTitle}>
              Garantía de Reputación Verificada
            </p>
          </div>
        </div>
      </div>

      {/* BADGE DE RATING - Más compacto */}
      <div className="flex items-center gap-3 bg-zinc-900/40 p-2 rounded-lg border border-transparent relative group overflow-hidden transition-all">
        <div className="p-1.5 bg-blue-500/10 rounded-md">
          <Sparkles size={14} className="text-blue-400" />
        </div>

        <div>
          <span className={typography.meta + " block mb-0.5"}>
            Rating Jefe
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-white leading-none tabular-nums">
              {displayScore}
            </span>
            <Star size={10} className="text-blue-500 fill-blue-500" />
          </div>
        </div>
      </div>

    </header>
  );
};

export default HeaderStats;