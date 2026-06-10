
export const RatingHeader = ({ companyName, displayName, onClose, isSubmitting }) => (
    <div className="relative text-center space-y-1.5 pt-4 md:pt-0">
        <button
            onClick={onClose}
            disabled={isSubmitting}
            className="hidden md:flex absolute -top-2 -right-2 p-2 text-zinc-600 hover:text-white transition-colors"
        >
            <X size={18} />
        </button>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] mb-2">
            <ShieldCheck size={10} /> Red de Confianza
        </div>
        
        <h2 className="text-xl font-black text-white tracking-tight leading-tight">
            Calificar Experiencia
        </h2>
        
        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest truncate px-4">
            {companyName} • {displayName}
        </p>
    </div>
);
