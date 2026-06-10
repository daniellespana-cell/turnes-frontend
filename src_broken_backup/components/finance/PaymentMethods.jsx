
const PaymentMethods = () => (
  <div className="bg-[#0f0f10] border border-transparent rounded-2xl p-5 space-y-4">
    <header className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-zinc-900 rounded-md text-emerald-400 border border-transparent">
          <CreditCard size={14} />
        </div>
        <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Medios Aceptados</h2>
      </div>
      <div className="flex items-center gap-1.5 opacity-50">
        <ShieldCheck size={12} className="text-emerald-500" />
        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Wompi Secure</span>
      </div>
    </header>

    <div className="grid grid-cols-3 gap-3">
      {/* Tarjetas */}
      <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-transparent bg-white/[0.02]">
        <CreditCard size={20} className="text-zinc-300" />
        <span className="text-[10px] font-medium text-zinc-400">Tarjetas</span>
      </div>

      {/* PSE */}
      <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-transparent bg-white/[0.02]">
        <Zap size={20} className="text-pink-500" />
        <span className="text-[10px] font-medium text-zinc-400">PSE</span>
      </div>

      {/* Billeteras / Nequi */}
      <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-transparent bg-white/[0.02]">
        <Smartphone size={20} className="text-purple-400" />
        <span className="text-[10px] font-medium text-zinc-400">Nequi / Davi</span>
      </div>
    </div>

    <p className="text-center text-[9px] text-zinc-600 pt-2">
      Seleccionarás tu medio preferido en el siguiente paso.
    </p>
  </div>
);

export default PaymentMethods;