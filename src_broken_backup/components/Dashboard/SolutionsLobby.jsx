import { useSolutionsLobby } from '../../hooks/useSolutionsLobby';

// Componentes Atómicos

/**
 * SolutionsLobby: Interfaz Pura (UI Only).
 * No habla con la BD. No tiene lógica de negocio anidada.
 */
export const SolutionsLobby = ({ onCreate }) => {
  const { services, handleAction, boostProps } = useSolutionsLobby(onCreate);

  // 🧹 Regla SSOT: Si no hay servicios procesados por el hook, no existe sección.
  if (services.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Orquestación de Modales (Delegada) */}
      <BoostFlowModal 
        isOpen={boostProps.isOpen} 
        onClose={boostProps.closeBoostFlow} 
        step={boostProps.step}
        onContinue={boostProps.goToPicker} 
        onConfirm={boostProps.executePurchase}
        userBalance={boostProps.userBalance} 
        price={boostProps.price} 
        isSubmitting={boostProps.isSubmitting}
      />

      {/* Header Visual */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <Sparkles size={11} className="text-zinc-500 opacity-60" />
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] font-manrope">
            Soluciones
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-2 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/40" />
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
            Inversión Directa
          </span>
        </div>
      </div>

      {/* Grid de Tarjetas Atómicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {services.map((serv, index) => (
          <SolutionCard 
            key={serv.id} 
            serv={serv} 
            index={index} 
            onClick={handleAction} 
          />
        ))}
      </div>
    </section>
  );
};

export default SolutionsLobby;
