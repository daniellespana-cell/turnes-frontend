
export const CardHeader = ({ vacancy }) => {
    return (
        <div className="flex justify-between items-start mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-zinc-800 p-0.5 border border-transparent overflow-hidden shrink-0">
                        <img
                            src={vacancy.businessLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(vacancy.business)}&background=27272a&color=a1a1aa`}
                            alt={`Logo de ${vacancy.business}`}
                            className="w-full h-full object-cover rounded-lg opacity-90"
                        />
                    </div>
                    {vacancy.isVerified && (
                        <div
                            aria-label="Empresa verificada"
                            className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-1 rounded-full border-2 border-zinc-900 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20"
                        >
                            <ShieldCheck size={10} strokeWidth={3} aria-hidden="true" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="text-white font-bold text-[11px] md:text-xs tracking-tight truncate max-w-[120px] md:max-w-[140px]">
                        {vacancy.business}
                    </h3>
                    <div className="text-[9px] text-zinc-500 flex items-center gap-1.5 font-medium mt-1 flex-wrap">
                        <div className="flex items-center gap-1 shrink-0">
                            <MapPin size={9} className="text-zinc-600 shrink-0" aria-hidden="true" />
                            {vacancy.distance}
                        </div>
                        <span className="text-zinc-800 shrink-0">•</span>
                        <div className="flex items-center gap-1 shrink-0 text-emerald-400">
                            <Clock size={10} className="shrink-0" aria-hidden="true" />
                            <span className="whitespace-nowrap font-black uppercase text-[10px] tracking-tight">
                                {vacancy.date}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {vacancy.type && (
                <div
                    aria-label={`Tipo: ${vacancy.type}`}
                    className={`px-1.5 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border flex items-center gap-1 shrink-0
                        ${vacancy.type === 'Fijo'
                            ? 'bg-purple-500/5 text-purple-400 border-purple-500/10'
                            : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'}`}
                >
                    {vacancy.type === 'Fijo' ? <Briefcase size={8} aria-hidden="true" /> : <Zap size={8} aria-hidden="true" />}
                    {vacancy.type}
                </div>
            )}
        </div>
    );
};
