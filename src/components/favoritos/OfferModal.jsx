import React from 'react';
import { X, Edit2, Zap, Wallet } from 'lucide-react';

import { useState, useEffect } from 'react';

const OfferModal = ({
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
  setDate
}) => {
  // 1. Hooks MUST be called unconditionally at the top level
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  useEffect(() => {
    // Reset state when modal is closed
    if (!show) setAcceptedTerms(false);
  }, [show]);

  // 2. Early return AFTER hooks
  if (!show || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-transparent w-full max-w-xs rounded-[2rem] overflow-hidden  animate-in zoom-in-95 duration-200">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Oferta Directa</span>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={16} /></button>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              {isEditing ? (
                <input
                  autoFocus
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  onBlur={() => setIsEditing(false)}
                  className="bg-transparent text-3xl font-black text-white w-32 text-center outline-none border-b border-purple-500"
                />
              ) : (
                <h2 className="text-4xl font-black text-white italic tracking-tighter">${amount.toLocaleString()}</h2>
              )}
              <button onClick={() => setIsEditing(true)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                <Edit2 size={12} />
              </button>
            </div>
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Pago en Efectivo al Staff</p>

            {/* Selector de Fecha Estilizado */}
            <div className="pt-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-center text-xs text-white font-bold uppercase tracking-wider outline-none border border-transparent rounded-lg py-2 px-4 w-full focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="bg-white/[0.02] rounded-2xl p-4 border border-transparent space-y-2">
            <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
              <span className="text-zinc-500">Plan Actual</span>
              <span className="text-purple-400">{user?.plan || 'BÁSICO'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-zinc-400 uppercase">Comisión Turnes</span>
              <span className="text-[10px] font-black text-emerald-500">
                {comision === 0 ? 'GRATIS' : `$${comision.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* 🛡️ CHECKBOX FIJA DE TRANSPARENCIA FINANCIERA FAST-TRACK */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-3">
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="fastTrackTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded appearance-none border border-emerald-500/50 checked:bg-emerald-500 checked:border-emerald-500 relative transition-colors cursor-pointer before:content-['✓'] before:absolute before:text-white before:text-[10px] before:font-black before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label htmlFor="fastTrackTerms" className="text-[10px] font-black uppercase tracking-widest text-emerald-400 cursor-pointer block">
                Términos de la Oferta
              </label>
              <p className="text-[9px] text-zinc-400 leading-tight">
                Entiendo que la comisión se descontará inmediatamente de mi billetera. <strong className="text-emerald-500 font-bold">Si el talento declina la oferta, mi saldo será reembolsado automáticamente.</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onConfirm}
            disabled={!acceptedTerms}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]  flex items-center justify-center gap-2 transition-all duration-300 ${acceptedTerms
                ? 'bg-white text-black hover:bg-emerald-500 hover:text-white active:scale-95'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
          >
            <Zap size={12} fill={acceptedTerms ? "currentColor" : "none"} /> Lanzar Oferta
          </button>

          <div className="flex items-center justify-center gap-2 opacity-30">
            <Wallet size={10} className="text-zinc-500" />
            <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">
              Saldo Disponible: ${user?.saldo?.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;