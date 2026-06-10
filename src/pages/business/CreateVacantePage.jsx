import Header from '../../components/CreateVacante/Header';
import ModalidadSelector from '../../components/CreateVacante/ModalidadSelector';
import DetallesForm from '../../components/CreateVacante/DetallesForm';
import ImpulsoSwitch from '../../components/CreateVacante/ImpulsoSwitch';
import ResumenLiquidacion from '../../components/CreateVacante/ResumenLiquidacion';
import LocationPickerModal from '../../components/CreateVacante/LocationPickerModal';

import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../services/financeService";
import { useCreateVacante } from "../../hooks/useCreateVacante";

// Sub-componentes Orquestadores

const CreateVacantePage = () => {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [isMapOpen, setIsMapOpen] = React.useState(false);

  const {
    formData,
    setFormData,
    walletBalance,
    isSubmitting,
    handlers, // All handlers provided by hook
    ui        // All UI states/memos provided by hook
  } = useCreateVacante(user);

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-4 md:pt-8 px-4 md:px-6 min-h-screen text-zinc-300 antialiased font-manrope">

      <Header onBack={() => navigate(-1)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mt-8">

        {/* LADO IZQUIERDO: CONFIGURACIÓN */}
        <div className="lg:col-span-8 space-y-10">
          <ModalidadSelector
            selectedType={formData.type}
            onChange={handlers.handleModalidadChange}
            userPlan={user?.plan ?? 'Plan Básico'}
            userCommission={user?.commission ?? '6%'}
          />

          <DetallesForm
            formData={formData}
            setFormData={setFormData}
            ui={ui.detalles}
            onQuantityChange={handlers.handleQuantityChange}
            onPaymentChange={handlers.handlePaymentChange}
            onOpenMap={() => setIsMapOpen(true)}
          />
        </div>

        {/* LADO DERECHO: LIQUIDACIÓN */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <ImpulsoSwitch
            isUrgent={formData.isUrgent}
            onChange={handlers.handleImpulsoChange}
            precio={ui.data.precioUnitarioUrgente || 7000}
          />

          <ResumenLiquidacion
            data={ui.data}
            ui={ui.resumen}
            walletBalance={walletBalance}
            formatCurrency={formatCurrency}
            isSubmitting={isSubmitting}
            userPlan={user?.plan}
            onPublish={handlers.handlePublish}
          />

          <footer className="px-6 opacity-40">
            <p className="text-[8px] text-zinc-600 font-bold uppercase text-center leading-relaxed tracking-tighter">
              Turnes actúa como puente de conexión. El cumplimiento del pago pactado es responsabilidad directa del empleador.
            </p>
          </footer>
        </aside>

        {/* MODALES QUIRÚRGICOS */}
        <LocationPickerModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          initialPos={{ lat: formData.lat, lng: formData.lng }}
          cityLabel={formData.location}
          onConfirm={handlers.handleLocationConfirm}
        />

      </div>
    </div>
  );
};

export default CreateVacantePage;
