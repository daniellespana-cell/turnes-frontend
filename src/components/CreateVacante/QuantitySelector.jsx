import React from 'react';
import { Users, Minus, Plus } from 'lucide-react';

const QuantitySelector = ({ quantity, onQuantityChange }) => (
  <div className="flex items-center gap-3 bg-zinc-950/20 border border-white/[0.04] rounded-xl px-4 py-3">
    <Users size={15} className="text-zinc-800 shrink-0" />
    <span className="text-zinc-500 text-[11px] uppercase font-bold tracking-wider flex-1">Personas</span>
    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1 border border-white/5">
      <button type="button" onClick={() => onQuantityChange(-1)} className="text-zinc-500 hover:text-white transition-colors">
        <Minus size={11}/>
      </button>
      <span className="text-[13px] font-black text-white w-4 text-center leading-none">{quantity}</span>
      <button type="button" onClick={() => onQuantityChange(1)} className="text-zinc-500 hover:text-white transition-colors">
        <Plus size={11}/>
      </button>
    </div>
  </div>
);

export default QuantitySelector;