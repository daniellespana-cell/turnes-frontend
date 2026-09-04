import React from 'react';
import MisVacantesHeader from '../../components/MisVacantes/MisVacantesHeader';
import VacantesControls from '../../components/MisVacantes/VacantesControls';
import VacantesTableContainer from '../../components/MisVacantes/VacantesTableContainer';
import VacantesTable from '../../components/MisVacantes/VacantesTable';
import ConfirmationModal from '../../components/common/ConfirmationModal';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks de lógica
import { useVacantesLogic } from '../../hooks/useVacantesLogic';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Componentes Orquestados (Todos desde la misma ruta)

const MisVacantesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null, type: 'delete' });

  const {
    vacantes,
    activeTab,
    setActiveTab,
    counts,
    handleAction,
    isLoading
  } = useVacantesLogic();

  // ELIMINADO: Bloqueo de carga para permitir "Immediate Rendering"
  // if (isLoading) { return <Spinner ... /> }

  const filteredData = vacantes.filter(v =>
    (v.title || '').toLowerCase().includes(query.toLowerCase())
  );

  const onActionTrigger = (id, action) => {
    if (action === 'delete-confirm') {
      setModalConfig({ isOpen: true, id, type: 'delete' });
      return;
    }

    if (action === 'relist' || action === 'duplicate') {
      const target = vacantes.find(v => String(v.id) === String(id));
      if (target) {
        const raw = target.raw || {};
        navigate('/publicar', {
          state: {
            relistFrom: {
              tags: Array.isArray(raw.etiquetas) && raw.etiquetas.length > 0 
                ? raw.etiquetas 
                : (target.title ? [target.title] : []),
              location: raw.direccion_formateada || target.direccion_formateada || '',
              lat: raw.lat ?? target.lat ?? null,
              lng: raw.lng ?? target.lng ?? null,
              description: raw.descripcion || '',
              schedule: raw.tipo_turno_id || '',
              payment: Number(raw.pago_monto || 0),
              type: raw.tipo_turno || target.type || 'temporal',
              quantity: 1,
              isUrgent: false,
              isLocationConfirmed: Boolean((raw.lat ?? target.lat) && (raw.lng ?? target.lng)),
              date: '' // Lista para recibir la nueva fecha seleccionada por la empresa
            }
          }
        });
        const toastMsg = action === 'relist'
          ? "Selecciona la nueva fecha para relanzar tu turno"
          : "Copia lista: Elige la fecha para el nuevo turno";
        showToast(toastMsg, "info");
      }
      return;
    }

    handleAction(id, action);
  };

  const handleConfirmAction = () => {
    if (modalConfig.type === 'delete') {
      handleAction(modalConfig.id, 'delete');
      showToast("Vacante eliminada permanentemente", "success");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-8 px-4 font-manrope text-zinc-300 antialiased min-h-screen">

      <MisVacantesHeader
        userPlan={user?.plan || 'Básico'}
        filteredCount={filteredData.length}
        onBack={() => navigate(-1)}
        onCreate={() => navigate('/publicar')}
      />

      <div className="space-y-10">
        <VacantesControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
          query={query}
          setQuery={setQuery}
        />

        <VacantesTableContainer>
          <VacantesTable
            data={filteredData}
            activeTab={activeTab}
            onAction={onActionTrigger}
            isLoading={isLoading} // Nueva Prop para Skeleton interno
          />
        </VacantesTableContainer>
      </div>


      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmAction}
        title="¿Eliminar Vacante?"
        message="La vacante será removida de tu panel. El historial de candidatos y calificaciones se preservará."
        confirmText="Sí, Eliminar"
        type="delete"
      />
    </div >
  );
};

export default MisVacantesPage;