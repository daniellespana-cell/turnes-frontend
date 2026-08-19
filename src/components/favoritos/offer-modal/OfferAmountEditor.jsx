import React, { useRef, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { formatCurrency } from '../../../services/financeService';

export const OfferAmountEditor = ({
  amount,
  localPriceStr,
  isEditing,
  setIsEditing,
  onPriceChange,
  onPriceBlur
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onPriceBlur();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
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
              onChange={onPriceChange}
              onBlur={onPriceBlur}
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
    </div>
  );
};

export default OfferAmountEditor;
