import { X, ShieldCheck, ArrowUpRight, Clock } from 'lucide-react';
import { AssetResolver } from '../../../utils/assetHelper';


export const VacancyDetailHeader = ({ vacancy, closeBtnRef, onClose, onCompanyClick }) => {
    return (
        <div className="sticky top-0 z-10 bg-[#0f0f11]/95 backdrop-blur-xl px-4 py-3.5 border-b border-white/5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
                {/* Company logo */}
                <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 p-[1px] border border-transparent overflow-hidden">
                        <img
                            src={AssetResolver.getLogo(vacancy.businessLogo, vacancy.business)}
                            alt={`Logo de ${vacancy.business}`}
                            className="w-full h-full object-cover rounded-[10px]"
                        />
                    </div>
                    {vacancy.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-[#0f0f11]"
                            title="Empresa verificada">
                            <ShieldCheck size={9} />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-white font-bold text-sm leading-tight truncate">
                        {vacancy.title}
                    </h2>
                    
                    <button
                        onClick={() => {
                            const id = vacancy.empresaId || vacancy.companyId || vacancy.empresa_id;
                            onCompanyClick?.(id || vacancy);
                        }}
                        className="flex items-center gap-1.5 mt-0.5 group/company text-left hover:opacity-80 transition-opacity"
                        type="button"
                        aria-label="Acción">
                        <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[150px] md:max-w-[250px] group-hover/company:text-emerald-400 transition-colors">
                            {vacancy.business}
                        </span>
                        
                        <ArrowUpRight size={10} className="text-zinc-600 group-hover/company:text-emerald-500 transition-colors" />

                        {vacancy.isVerified && (
                            <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter whitespace-nowrap ml-1">
                                Elite
                            </span>
                        )}
                    </button>

                    {/* 🕒 SHIFT DATE BADGE (High Visibility) */}
                    <div className="flex items-center gap-1.5 mt-2 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        <Clock size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">
                            {vacancy.date || 'Fecha a convenir'}
                        </span>
                    </div>
                </div>
            </div>
            <button
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Cerrar detalle de vacante"
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800/60 border border-white/8 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all"
                type="button">
                <X size={16} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default VacancyDetailHeader;
