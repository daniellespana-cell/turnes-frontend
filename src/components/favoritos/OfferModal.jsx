import React, { useState, useEffect, useRef } from 'react';
import { X, Edit2, Zap, Wallet, Calendar } from 'lucide-react';
import { formatCurrency } from '../../services/financeService';
import Spinner from '../ui/Spinner';

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
  const inputRef = useRef(null);

  // Sincronizar string formateado al abrir o al cambiar amount externo
  useEffect(() => {
    if (show) {
      setAcceptedTerms(false);
      setLocalPriceStr(amount > 0 ? Number(amount).toLocaleString('es-CO') : '');
    }
  }, [show, amount]);

  // Auto-foco y selección completa del texto al entrar en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!show || !staff) return null;

  // Manejo de edición de precio fluido (sin '0' pegajoso al borrar)
  const handlePriceChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setLocalPriceStr('');
      setAmount(0);
      return;
    }
    const parsedNum = Math.min(20000000, parseInt(rawDigits, 10)); // Tope seguro 20M COP
    setLocalPriceStr(parsedNum.toLocaleString('es-CO'));
    setAmount(parsedNum);
  };

  const handlePriceBlur = () => {
    // Si el usuario dejó el campo vacío o en 0, restauramos el sugerido del staff
    if (!amount || amount < 10000) {
      const fallbackAmount = staff?.payment || 50000;
      setAmount(fallbackAmount);
      setLocalPriceStr(fallbackAmount.toLocaleString('es-CO'));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePriceBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
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

          {/* Precio y Edición Fluida */}
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <div className="flex items-baseline justify-center border-b-2 border-emerald-500 pb-1">
                  <span className="text-3xl font-black text-emerald-400 mr-1">$</span>
                  <input
                    ref={inputRef}
                    id="offerAmountInput"
                    name="offerAmount"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={localPriceStr}
                    placeholder="50.000"
                    onChange={handlePriceChange}
                    onBlur={handlePriceBlur}
                    onKeyDown={handleKeyDown}
                    aria-label="Monto de la oferta en pesos colombianos"
                    className="bg-transparent text-3xl font-black text-white w-36 text-center outline-none tracking-tight font-manrope"
                  />
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditing(true)}
                  className="group/price flex items-center justify-center gap-2.5 cursor-pointer py-1 px-3 rounded-2xl hover:bg-white/5 transition-all"
                  title="Haz clic para editar el monto"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsEditing(true)}
                  aria-label="Editar monto de la oferta"
                >
                  <h2 className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter tabular-nums group-hover/price:text-emerald-400 transition-colors">
                    {formatCurrency(amount)}
                  </h2>
                  <div className="p-1.5 bg-white/5 rounded-full text-zinc-400 group-hover/price:text-white group-hover/price:bg-emerald-500/20 group-hover/price:scale-110 transition-all">
                    <Edit2 size={13} />
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
              Pago en Efectivo al Staff
            </p>

            {/* Selector de Fecha Estilizado */}
            <div className="pt-2">
              <div className="relative flex items-center">
                <input
                  id="offerDateInput"
                  name="offerDate"
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Fecha del turno"
                  className="bg-zinc-900/60 border border-white/5 focus:border-emerald-500/50 rounded-xl py-2.5 px-4 text-center text-xs text-white font-bold uppercase tracking-wider outline-none w-full transition-colors [color-scheme:dark] cursor-pointer"
                />
                <Calendar size={14} className="absolute right-3.5 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Breakdown de Comisión y Plan */}
          <div className="bg-zinc-900/40 rounded-2xl p-3.5 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
              <span className="text-zinc-500">Plan Actual</span>
              <span className="text-purple-400 font-black">{userPlan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-zinc-400 uppercase">Comisión Turnes</span>
              <span className="text-[11px] font-black text-emerald-400 tabular-nums">
                {comision === 0 ? 'GRATIS' : formatCurrency(comision)}
              </span>
            </div>
          </div>

          {/* Términos de la Oferta Directa */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-3 items-start">
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="fastTrackTerms"
                name="fastTrackTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded appearance-none border border-emerald-500/50 checked:bg-emerald-500 checked:border-emerald-500 relative transition-colors cursor-pointer before:content-['✓'] before:absolute before:text-white before:text-[10px] before:font-black before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label htmlFor="fastTrackTerms" className="text-[10px] font-black uppercase tracking-widest text-emerald-400 cursor-pointer block leading-none">
                Términos de la Oferta
              </label>
              <p className="text-[9px] text-zinc-400 leading-tight">
                Entiendo que la comisión se descontará inmediatamente de mi billetera. <strong className="text-emerald-400 font-bold">Si el talento declina la oferta, mi saldo será reembolsado automáticamente.</strong>
              </p>
            </div>
          </div>

          {/* Botón de Acción Final */}
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

          {/* Saldo de Billetera */}
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