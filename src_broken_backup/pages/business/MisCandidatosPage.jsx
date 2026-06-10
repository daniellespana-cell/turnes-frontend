import { useCandidatosLogic } from "../../hooks/useCandidatosLogic";

// Importaciones de dominio

const MisCandidatosPage = () => {
  // ✅ FIX: Desestructuración con valores de respaldo (Fallbacks)
  // Esto evita que 'stats.score' sea undefined en el primer milisegundo
  const {
    activeTab = 'pendientes',
    setActiveTab = () => { },
    stats,
    pendientes = [],
    historial = [],
    updateCandidato,
    sellarTurno,
    dismissFromHistory
  } = useCandidatosLogic() || {};

  return (
    <div className="p-4 md:p-10 min-h-screen font-manrope">

      {/* Score calculado o null */}
      <HeaderStats score={stats?.score} />

      <div className="max-w-7xl mx-auto mb-12 flex justify-end">
        <TabSelector
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
        />
      </div>

      <CandidatosContent
        activeTab={activeTab}
        pendientes={pendientes}
        historial={historial}
        onUpdate={updateCandidato}
        onDismiss={dismissFromHistory}
        // Conexión Cerebral: Aseguramos el paso de (id, vacanteId)
        onSellar={(id, vId) => sellarTurno && sellarTurno(id, vId)}
      />

    </div>
  );
};

export default MisCandidatosPage;