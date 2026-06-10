
export const ContractHeader = ({ isSealed, isConfirmed, transactionId }) => {

    // Style Logic
    const getStyles = () => {
        if (isSealed) return {
            container: 'bg-blue-500/5 border-blue-500/20',
            text: 'text-blue-400',
            icon: <History size={14} className="text-blue-400" />,
            label: 'Registro Archivado'
        };
        if (isConfirmed) return {
            container: 'bg-emerald-500/5 border-emerald-500/10',
            text: 'text-emerald-500',
            icon: <ShieldCheck size={14} className="text-emerald-500" />,
            label: 'Acuerdo en Firme'
        };
        return {
            container: 'bg-zinc-900/20 border-white/5',
            text: 'text-zinc-500',
            icon: <Lock size={14} className="text-zinc-600" />,
            label: 'Blindaje Activo'
        };
    };

    const style = getStyles();

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${style.container}`}>
            <div className="shrink-0">
                {style.icon}
            </div>
            <div className="flex flex-col leading-tight">
                <span className={`text-[9px] font-black uppercase tracking-wider ${style.text}`}>
                    {style.label}
                </span>
                <span className="text-[7px] font-mono text-zinc-800 uppercase italic">
                    TX-{transactionId}
                </span>
            </div>
        </div>
    );
};
