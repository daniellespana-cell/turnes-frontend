import React from 'react';
import { Calendar } from 'lucide-react';

export const OfferDateSelector = ({ date, setDate }) => {
  const minDate = new Date().toISOString().split('T')[0];

  return (
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
  );
};

export default OfferDateSelector;
