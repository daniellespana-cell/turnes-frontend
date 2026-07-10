import React from 'react';
import { Star, Zap } from 'lucide-react';

import { AssetResolver } from '../../utils/assetHelper';

const StaffCard = ({ staff, onOffer }) => {
  return (
    <div className="group bg-zinc-900/10 border border-transparent p-5 rounded-xl hover:bg-zinc-900/30 transition-all duration-500 relative">
      <div className="flex items-start justify-between mb-4">
        <img
          src={AssetResolver.getAvatar(staff.avatar_url || staff.avatar || staff.avatarUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name || staff.id}`}
          className="w-16 h-16 rounded-full border border-transparent bg-zinc-800 object-cover"
          alt={staff.name}
        />
        <div className="flex items-center gap-1.5">
          {/* BADGE VERIFICACIÓN */}
          {staff.verified && (
            <div className="bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 flex items-center gap-1.5">
              <Zap size={12} className="text-blue-400 fill-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Elite</span>
            </div>
          )}
          {/* BADGE CALLE */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            <Star size={12} className="text-emerald-500 fill-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Calificado</span>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h4 className="text-base font-black text-white uppercase italic tracking-tight">{staff.name}</h4>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1.5">{staff.role || 'Staff Validado'}</p>
      </div>
      <button
        onClick={() => onOffer(staff)}
        className="w-full py-3 bg-white text-black rounded-xl text-xs font-black uppercase tracking-wider hover:!bg-emerald-500 hover:!text-white transition-all flex items-center justify-center gap-2"
        type="button"
        aria-label="Acción">
        <Zap size={14} /> Contratar Ahora
      </button>
    </div>
  );
};

export default StaffCard;