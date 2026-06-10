import { Wallet } from 'lucide-react';

import React from 'react';

const FinanceHero = React.memo(({ totalEarned, label = 'Sueldo Acumulado' }) => {
    return (
        <div className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col items-center text-center shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
            
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-12">
                <Wallet size={28} className="text-black -rotate-12" />
            </div>
            
            <h2 className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                {label}
            </h2>
            <div className="text-6xl font-black text-white tracking-tighter mt-1 relative z-10">
                ${(totalEarned || 0).toLocaleString()}
            </div>
            <p className="text-zinc-500 text-[10px] mt-4 font-medium max-w-[200px] leading-relaxed relative z-10">
                Total de pagos confirmados en la plataforma
            </p>
        </div>
    );
});

export default FinanceHero;
