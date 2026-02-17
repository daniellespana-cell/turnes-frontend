import React from 'react';
import { useCandidatosLogic } from "../../hooks/useCandidatosLogic";

// Importaciones de dominio
import HeaderStats from '../../components/candidatos/HeaderStats';
import TabSelector from '../../components/candidatos/TabSelector';
import CandidatosContent from '../../components/candidatos/CandidatosContent';

const MisCandidatosPage = () => {
  // ✅ FIX: Desestructuración con valores de respaldo (Fallbacks)
  // Esto evita que 'stats.score' sea undefined en el primer milisegundo
  const {
    activeTab = 'pendientes',
    setActiveTab = () => { },
    stats = { score: "5.0", totalPendientes: 0, totalHistorial: 0 },
    pendientes = [],
    historial = [],
    updateCandidato,
    sellarTurno
  } = useCandidatosLogic() || {};

  return (
    <div className="p-4 md:p-10 min-h-screen font-manrope">

      {/* Ahora stats.score siempre tendrá al menos "5.0" como fallback */}
      <HeaderStats score={stats.score} />

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
        // Conexión Cerebral: Aseguramos el paso de (id, vacanteId)
        onSellar={(id, vId) => sellarTurno && sellarTurno(id, vId)}
      />

    </div>
  );
};

export default MisCandidatosPage;