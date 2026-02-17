import React from 'react';
import { X, Edit2, Zap, Wallet } from 'lucide-react';

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
  if (!show || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-xs rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
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
                className="bg-transparent text-center text-xs text-white font-bold uppercase tracking-wider outline-none border border-white/10 rounded-lg py-2 px-4 w-full focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 space-y-2">
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

          <button
            onClick={onConfirm}
            className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2"
          >
            <Zap size={12} fill="currentColor" /> Lanzar Oferta
          </button>

          <div className="flex items-center justify-center gap-2 opacity-30">
            <Wallet size={10} className="text-zinc-500" />
            <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500">
              Saldo: ${user?.saldo?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;