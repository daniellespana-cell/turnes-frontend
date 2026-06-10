
const RechargeAmount = ({ amount, setAmount, onAmountChange }) => {
  const MIN_AMOUNT = 20000;
  const QUICK_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

  // Validación de error: monto mayor a 0 pero menor al mínimo
  const isInvalid = amount > 0 && amount < MIN_AMOUNT;

  // Formateador de moneda para visualización (es-CO)
  const formatDisplay = (val) => {
    if (!val || val === 0) return '';
    return new Intl.NumberFormat('es-CO').format(val);
  };

  const handleInputChange = (e) => {
    // Sanitización: dejamos solo dígitos para evitar NaN
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue ? Number(rawValue) : 0;

    // Limitar a un máximo razonable (ej. 10 millones) para evitar errores de desbordamiento
    if (numericValue <= 10000000) {
      setAmount(numericValue);
    }
  };

  const handleQuickAmount = (val) => {
    setAmount(val);
    if (onAmountChange) onAmountChange(`Monto fijado en $${formatDisplay(val)}`);
  };

  return (
    <div className="bg-[#0f0f10] border border-transparent rounded-2xl p-5 space-y-4 transition-all hover:bg-[#0f0f10]/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-900 rounded-md text-emerald-400 border border-transparent">
            <CreditCard size={14} />
          </div>
          <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Monto de Recarga</h2>
        </div>

        {/* Feedback visual de error */}
        {isInvalid && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/10">
            <AlertCircle size={12} /> Mínimo $20k
          </span>
        )}
      </div>

      {/* Contenedor del Input con estado de error visual */}
      <div className={`relative bg-zinc-900/30 border rounded-xl px-4 py-3 transition-all duration-300 ${isInvalid
        ? 'border-red-500/30 bg-red-500/5'
        : 'border-white/5 focus-within:border-emerald-500/30 focus-within:bg-zinc-900/50'
        }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-medium transition-colors ${isInvalid ? 'text-red-400' : 'text-zinc-500'}`}>
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={formatDisplay(amount)}
            onChange={handleInputChange}
            className="bg-transparent text-2xl font-bold text-white w-full outline-none placeholder:text-zinc-800 focus:ring-0 border-none tracking-tight font-manrope"
            placeholder="0"
          />
        </div>
      </div>

      {/* Botones de acceso rápido */}
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((val) => (
          <button
            key={val}
            onClick={() => handleQuickAmount(val)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border active:scale-95 ${amount === val
              ? 'bg-white text-black border-white shadow-lg shadow-white/10'
              : 'bg-transparent text-zinc-500 border-white/5  hover:text-zinc-300'
              }`}
          >
            ${(val / 1000)}k
          </button>
        ))}
      </div>

      {/* Info adicional sutil */}
      <p className="text-[9px] text-zinc-700 font-medium text-center pt-1">
        Acreditación inmediata
      </p>
    </div>
  );
};

export default RechargeAmount;