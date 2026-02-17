import React from 'react';
import { Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ConfirmAcuerdoModal = ({ isOpen, onClose, onConfirm, finanzas, loading }) => {
  if (!isOpen) return null;

  // Validación Senior: Si los datos financieros son inconsistentes, bloqueamos la acción
  const isDataInvalid = !finanzas || finanzas.total <= 0 || finanzas.pagoPersonal <= 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Decoración de fondo para denotar seguridad */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="flex justify-center">
          <div className={`p-4 rounded-full ${isDataInvalid ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
            {isDataInvalid ? (
              <AlertTriangle className="text-red-500" size={32} />
            ) : (
              <ShieldCheck className="text-blue-500" size={32} />
            )}
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-white font-black uppercase tracking-widest text-sm">
            {isDataInvalid ? 'Error de Integridad' : 'Ejecutar Acuerdo'}
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tighter leading-relaxed">
            {isDataInvalid 
              ? 'No se han detectado parámetros financieros válidos para esta vacante.' 
              : <>Al confirmar, autorizas el débito de <span className="text-white">${finanzas.cargoServicio.toLocaleString()}</span> por cargos de gestión. El sueldo pactado es de <span className="text-white">${finanzas.pagoPersonal.toLocaleString()}</span>.</>
            }
          </p>
        </div>

        {/* Desglose Financiero - Solo se muestra si hay data válida */}
        {!isDataInvalid && (
          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-zinc-500">Pago al Talento</span>
              <span className="text-white">${finanzas.pagoPersonal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-zinc-500">Comisión de Servicio</span>
              <span className="text-white">${finanzas.cargoServicio.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
              <span className="text-blue-500">Total a Validar</span>
              <span className="text-blue-500">${finanzas.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={onConfirm}
            disabled={loading || isDataInvalid}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95
              ${isDataInvalid 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              }`}
          >
            {loading ? 'Procesando Protocolo...' : (isDataInvalid ? 'Datos Inválidos' : 'Autorizar y Pagar')}
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3 text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            {isDataInvalid ? 'Cerrar y Revisar' : 'Cancelar Protocolo'}
          </button>
        </div>

        {/* Nota legal sutil */}
        <p className="text-[7px] text-zinc-800 uppercase font-black text-center tracking-[0.3em]">
          Turnes Secured Transaction v1.0
        </p>
      </div>
    </div>
  );
};