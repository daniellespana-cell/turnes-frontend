import React from 'react';
import { AlertTriangle } from 'lucide-react';


const ConfirmNavigationModal = ({ isOpen, onConfirm, onCancel }) => {
  // CRÍTICO: El modal debe desmontarse físicamente si no está abierto
  // para liberar cualquier referencia al blocker del router.
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0f0f10] border border-transparent p-8 rounded-[2.5rem] max-w-sm w-full text-center space-y-6  animate-in zoom-in-95 duration-300">
        
        {/* ICONO DE ADVERTENCIA */}
        <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="text-amber-500" size={36} />
        </div>
        
        {/* TEXTO INFORMATIVO */}
        <div className="space-y-3">
          <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter">
            ¿Confirmar <span className="text-amber-500">Salida</span>?
          </h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed px-2">
            Tienes un proceso de pago activo. Si abandonas esta pantalla, la transacción podría cancelarse.
          </p>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-white text-black hover:bg-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg"
            type="button"
            aria-label="Acción">
            Confirmar Salida
          </button>
          
          <button
            onClick={onCancel}
            className="w-full py-4 bg-zinc-900 text-zinc-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
            type="button"
            aria-label="Acción">
            Volver al pago
          </button>
        </div>

        {/* FOOTER DE SEGURIDAD */}
        <div className="pt-2 opacity-20">
          <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
            Protección de Transacción Activa
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNavigationModal;