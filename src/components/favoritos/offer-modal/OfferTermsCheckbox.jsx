import React from 'react';

export const OfferTermsCheckbox = ({ acceptedTerms, setAcceptedTerms }) => {
  return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-3 items-start font-manrope">
      <div className="pt-0.5">
        <input
          type="checkbox"
          id="fastTrackTerms"
          name="fastTrackTerms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="w-4 h-4 rounded appearance-none border border-emerald-500/50 checked:bg-emerald-500 checked:border-emerald-500 relative transition-colors cursor-pointer before:content-['✓'] before:absolute before:text-white before:text-[10px] before:font-black before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
        />
      </div>
      <div className="flex-1 space-y-1">
        <label htmlFor="fastTrackTerms" className="text-[10px] font-black uppercase tracking-widest text-emerald-400 cursor-pointer block leading-none">
          Términos de la Oferta
        </label>
        <p className="text-[9px] text-zinc-400 leading-tight">
          Entiendo que la comisión se descontará inmediatamente de mi billetera. <strong className="text-emerald-400 font-bold">Si el talento declina la oferta, mi saldo será reembolsado automáticamente.</strong>
        </p>
      </div>
    </div>
  );
};

export default OfferTermsCheckbox;
