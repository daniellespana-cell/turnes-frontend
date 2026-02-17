import React from 'react';
import { Star, Zap } from 'lucide-react';

const StaffCard = ({ staff, onOffer }) => {
  return (
    <div className="group bg-zinc-900/10 border border-white/5 p-5 rounded-xl hover:bg-zinc-900/30 transition-all duration-500 relative">
      <div className="flex items-start justify-between mb-4">
        <img 
          src={staff.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} 
          className="w-12 h-12 rounded-full border border-white/10 bg-zinc-800" 
          alt={staff.name} 
        />
        <div className="flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          <Star size={8} className="text-emerald-500 fill-emerald-500" />
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Calificado</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-black text-white uppercase italic tracking-tight">{staff.name}</h4>
        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-2">{staff.role || 'Staff Validado'}</p>
      </div>

      <button 
        onClick={() => onOffer(staff)} 
        className="w-full py-2.5 bg-white text-black rounded-lg text-[8px] font-black uppercase tracking-[0.2em] hover:!bg-emerald-500 hover:!text-white transition-all flex items-center justify-center gap-2"
      >
        <Zap size={10} /> Contratar Ahora
      </button>
    </div>
  );
};

export default StaffCard;