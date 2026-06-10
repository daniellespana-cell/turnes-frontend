import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

const VacantesTable = ({ data, activeTab, onAction, isLoading }) => {
  const navigate = useNavigate();

  // Carga Eliminada: Permitimos renderizado inmediato o EmptyState
  // El Skeleton estaba bloqueando la vista de "Mis Vacantes" creando percepción de congelamiento

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Info}
        title={`No hay vacantes en ${activeTab}`}
        description="Publica una nueva vacante para comenzar a recibir candidatos calificados."
        actionLabel={activeTab === 'Activa' ? "Publicar Vacante" : null}
        onAction={activeTab === 'Activa' ? () => navigate('/publicar') : undefined}
      />
    );
  }

  return (
    <div className="w-full">
      {/* CABECERA DE TABLA: Visible solo en desktop */}
      {/* Minimal Header */}
      <div className="hidden md:grid grid-cols-12 px-6 pb-2 border-b border-white/5 text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-4">
        <div className="col-span-5">Rol & Contexto</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-1 text-center">Fecha</div>
        <div className="col-span-1 text-center">Costo</div>
        <div className="col-span-3 text-right">Acciones</div>
      </div>

      {/* LISTADO DE FILAS: Espaciado optimizado para visualización fluida */}
      <div className="space-y-4 md:space-y-3">
        {data.map((vacante) => (
          <VacanteRow
            key={vacante.id}
            data={vacante}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
};

export default VacantesTable;