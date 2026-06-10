import React from 'react';


const SkeletonWallet = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10 animate-pulse">
      
      {/* --- HEADER SKELETON --- */}
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-zinc-800 rounded-full" />
          <div className="h-8 w-48 bg-zinc-800 rounded-xl" />
        </div>
        <div className="h-12 w-40 bg-zinc-800 rounded-[1.2rem]" />
      </div>

      {/* --- GRID DE BILLETERA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card de Balance Principal (Simula la WalletCard) */}
        <div className="lg:col-span-8 h-[280px] bg-[#0f0f10] border border-transparent rounded-[2.5rem] relative overflow-hidden">
          {/* Efecto Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          
          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-zinc-800 rounded-full" />
              <div className="h-14 w-64 bg-zinc-800 rounded-2xl" />
            </div>
            
            <div className="flex gap-4 pt-4">
              <div className="h-14 w-36 bg-zinc-800 rounded-2xl" />
              <div className="h-14 w-36 bg-zinc-800 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Stats Laterales (Simula Ingresos/Comisiones) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-[128px] bg-[#0f0f10] border border-transparent rounded-[2rem] p-8 flex flex-col justify-center gap-3">
            <div className="h-3 w-20 bg-zinc-800 rounded-full" />
            <div className="h-7 w-32 bg-zinc-800 rounded-lg" />
          </div>
          <div className="h-[128px] bg-[#0f0f10] border border-transparent rounded-[2rem] p-8 flex flex-col justify-center gap-3">
            <div className="h-3 w-20 bg-zinc-800 rounded-full" />
            <div className="h-7 w-32 bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>

      {/* --- TABLA DE TRANSACCIONES SKELETON --- */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-4 w-44 bg-zinc-800 rounded-full" />
          <div className="h-4 w-20 bg-zinc-800/50 rounded-full" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-6 bg-[#0f0f10]/50 border border-transparent rounded-[1.8rem]"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-4 w-40 bg-zinc-800 rounded-full" />
                  <div className="h-3 w-24 bg-zinc-800/50 rounded-full" />
                </div>
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <div className="h-5 w-24 bg-zinc-800 rounded-lg" />
                <div className="h-3 w-16 bg-zinc-800/30 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SkeletonWallet;