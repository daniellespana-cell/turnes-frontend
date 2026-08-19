import React, { useState, useEffect } from 'react';
import { X, Zap, Wallet } from 'lucide-react';
import { formatCurrency } from '../../services/financeService';
import Spinner from '../ui/Spinner';
import OfferAmountEditor from './offer-modal/OfferAmountEditor';
import OfferDateSelector from './offer-modal/OfferDateSelector';
import OfferBreakdown from './offer-modal/OfferBreakdown';
import OfferTermsCheckbox from './offer-modal/OfferTermsCheckbox';

/**
 * OfferModal (Senior Atomic Orchestrator)
 * Cohesionada, modular y 100% libre de código monolítico.
 */
export const OfferModal = ({
  show,
  onClose,
  staff,
  amount,
  setAmount,
  isEditing,
  setIsEditing,
  onConfirm,
  comision,
  user,
  date,
  setDate,
  isSubmitting = false
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localPriceStr, setLocalPriceStr] = useState('');

  useEffect(() => {
    if (show) {
      setAcceptedTerms(false);
      setLocalPriceStr(amount > 0 ? Number(amount).toLocaleString('es-CO') : '');
    }
  }, [show, amount]);

  if (!show || !staff) return null;

  const handlePriceChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setLocalPriceStr('');
      setAmount(0);
      return;
    }
    const parsedNum = Math.min(20000000, parseInt(rawDigits, 10));
    setLocalPriceStr(parsedNum.toLocaleString('es-CO'));
    setAmount(parsedNum);
  };

  const handlePriceBlur = () => {
    if (!amount || amount < 10000) {
      const fallbackAmount = staff?.payment || 50000;
      setAmount(fallbackAmount);
      setLocalPriceStr(fallbackAmount.toLocaleString('es-CO'));
    }
    setIsEditing(false);
  };

  const saldoActual = Number(user?.saldo || 0);
  const userPlan = (user?.plan || 'BÁSICO').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Modal de Oferta Directa"
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-xs sm:max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 font-manrope relative"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Oferta Directa
            </span>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              type="button"
              aria-label="Cerrar modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Editor de Precio y Selector de Fecha */}
          <div className="space-y-2">
            <OfferAmountEditor
              amount={amount}
              localPriceStr={localPriceStr}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onPriceChange={handlePriceChange}
              onPriceBlur={handlePriceBlur}
            />
            <OfferDateSelector date={date} setDate={setDate} />
          </div>

          {/* Breakdown Financiero */}
          <OfferBreakdown userPlan={userPlan} comision={comision} />

          {/* Términos */}
          <OfferTermsCheckbox acceptedTerms={acceptedTerms} setAcceptedTerms={setAcceptedTerms} />

          {/* Botón de Acción */}
          <button
            onClick={onConfirm}
            disabled={!acceptedTerms || isSubmitting}
            className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
              acceptedTerms && !isSubmitting
                ? 'bg-white text-black hover:bg-emerald-500 hover:text-white shadow-emerald-500/20 active:scale-95 cursor-pointer'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-60'
            }`}
            type="button"
            aria-label="Lanzar oferta directa al candidato"
          >
            {isSubmitting ? (
              <><Spinner size="sm" variant="white" /> Lanzando Oferta...</>
            ) : (
              <><Zap size={12} fill={acceptedTerms ? "currentColor" : "none"} /> Lanzar Oferta</>
            )}
          </button>

          {/* Billetera */}
          <div className="flex items-center justify-center gap-1.5 opacity-60">
            <Wallet size={11} className="text-zinc-500" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 tabular-nums">
              Saldo Disponible: {formatCurrency(saldoActual)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;