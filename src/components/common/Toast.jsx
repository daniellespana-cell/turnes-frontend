import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

import { useEffect } from 'react';

// Colores ajustados para resaltar sobre el fondo negro de Turnes
const styles = {
  success: 'border-emerald-500/30 text-emerald-400 bg-zinc-950/90 shadow-emerald-500/10',
  error: 'border-red-500/30 text-red-400 bg-zinc-950/90 shadow-red-500/10',
  info: 'border-blue-500/30 text-blue-400 bg-zinc-950/90 shadow-blue-500/10',
  warning: 'border-amber-500/30 text-amber-400 bg-zinc-950/90 shadow-amber-500/10'
};

const icons = {
  success: <CheckCircle size={16} strokeWidth={3} />,
  error: <XCircle size={16} strokeWidth={3} />,
  info: <Info size={16} strokeWidth={3} />,
  warning: <AlertTriangle size={16} strokeWidth={3} />
};

const Toast = ({ data, onClose }) => {
  const { type, message } = data || {};

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose, data]);

  // Guard clause para evitar renders nulos
  if (!data) return null;

  return (
    /* z-[9999] + env(safe-area-inset-bottom): garantiza visibilidad en iPhone con home bar */
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 w-full max-w-sm"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
    >
      <div className={`
        flex items-center gap-3 px-6 py-4 
        rounded-[1.5rem] border backdrop-blur-2xl 
        shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]
        animate-in slide-in-from-bottom-8 fade-in duration-500
        ${styles[type]}
      `}>
        {/* Icono con brillo sutil */}
        <div className="drop-shadow-md">
          {icons[type]}
        </div>

        {/* Texto */}
        <span className="text-[10.5px] font-black uppercase tracking-[0.15em] leading-tight break-words min-w-0">
          {message}
        </span>
      </div>
    </div>
  );
};

export default Toast;