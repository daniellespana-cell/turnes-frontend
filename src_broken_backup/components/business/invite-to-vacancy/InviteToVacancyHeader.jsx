
export const InviteToVacancyHeader = ({ candidateName, onClose }) => (
    <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <UserPlus size={20} />
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
                <X size={18} />
            </button>
        </div>
        <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight">
                Invitar Candidato
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                Para: <span className="text-zinc-300">{candidateName}</span>
            </p>
        </div>
    </div>
);
