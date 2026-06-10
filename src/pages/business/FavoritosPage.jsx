import React from 'react';
import { Heart } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import FavoritosHeader from '../../components/favoritos/FavoritosHeader';
import StaffCard from '../../components/favoritos/StaffCard';
import OfferModal from '../../components/favoritos/OfferModal';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useFavoritos } from '../../hooks/useFavoritos';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CandidateActionService } from '../../services/candidateActionService';

// Sub-componentes

const FavoritosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favoritos, loading } = useFavoritos();
  const { showToast } = useToast();

  const [showOfferPanel, setShowOfferPanel] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [offerAmount, setOfferAmount] = useState(0);
  const [offerDate, setOfferDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Externalized Financial Rule execution (Local approximation for UI)
  const comisionActual = useMemo(() => {
    if (!offerAmount) return 0;
    const plan = user?.plan?.toLowerCase();
    let rate = 0.06; // Default Básico
    if (plan === 'pro') rate = 0;
    if (plan === 'micro') rate = 0.04;
    return Math.round(offerAmount * rate);
  }, [offerAmount, user?.plan]);

  const handleOpenOffer = (staff) => {
    setSelectedStaff(staff);
    setOfferAmount(staff.payment || 50000);
    setOfferDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Default Tomorrow
    setShowOfferPanel(true);
  };

  const handleLanzarOferta = async () => {
    if (isSubmitting) return;

    // UI Validations
    const saldoActual = Number(user?.saldo || 0);
    if (saldoActual < comisionActual) {
      showToast(`Saldo insuficiente para comision. Tu saldo: $${saldoActual}`, 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // Delegating heavy lifting to Service
      const result = await CandidateActionService.launchRehireOffer(
        selectedStaff,
        offerAmount,
        offerDate
      );

      setShowOfferPanel(false);

      if (result.success) {
        navigate(result.redirectUrl);
      }
    } catch (error) {
      console.error("❌ Error lanzando oferta:", error);
      setIsSubmitting(false);
      showToast(`Error al lanzar oferta: ${error.message || 'Error Desconocido'}`, 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="md" variant="emerald" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-4 md:pt-8 px-4 animate-fade-in font-manrope antialiased min-h-screen">

      <FavoritosHeader
        onBack={() => navigate(-1)}
        count={favoritos.length}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favoritos.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
            <Heart className="mx-auto text-zinc-800 mb-4" size={40} />
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest italic">Tu bóveda de favoritos está vacía</p>
          </div>
        ) : (
          favoritos.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              onOffer={handleOpenOffer}
            />
          ))
        )}
      </div>

      <OfferModal
        show={showOfferPanel}
        onClose={() => setShowOfferPanel(false)}
        staff={selectedStaff}
        amount={offerAmount}
        setAmount={setOfferAmount}
        date={offerDate}
        setDate={setOfferDate}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onConfirm={handleLanzarOferta}
        comision={comisionActual}
        user={user}
      />
    </div>
  );
};

export default FavoritosPage;