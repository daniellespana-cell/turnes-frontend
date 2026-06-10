import { useCandidatosLogic } from '../../hooks/useCandidatosLogic';
import { typography } from '../../styles/typography';

const ReputationBanner = () => {
  // El componente se sirve a sí mismo los datos
  const { stats } = useCandidatosLogic();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-zinc-900 to-black border border-blue-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group  shadow-blue-500/5"
    >
      <div className="absolute top-0 right-0 p-4">
        <Sparkles size={18} className="text-blue-500 animate-pulse" />
      </div>
      
      <span className={typography.sectionTitle}>Nivel de Confianza</span>
      
      <div className="mt-4 flex items-end gap-3">
        {/* Usamos el valor real del hook o 5.0 por defecto */}
        <span className={`${typography.data} text-5xl text-white`}>
          {stats?.score || "5.0"}
        </span>
        <div className="mb-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={i < Math.round(stats?.score || 5) ? "text-blue-500 fill-blue-500" : "text-zinc-800"} 
              />
            ))}
          </div>
          <p className={`${typography.meta} mt-1 text-blue-400 italic`}>Líder Verificado</p>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span className={typography.meta}>Historial Limpio</span>
        </div>
        <span className={`${typography.data} text-[10px] text-zinc-500`}>
          {stats?.totalHistorial || 0} Turnos
        </span>
      </div>
    </motion.div>
  );
};

export default ReputationBanner;