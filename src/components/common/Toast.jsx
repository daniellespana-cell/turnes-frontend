import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

import { useEffect } from 'react';

// Colores ajustados para resaltar sobre el fondo negro de Turnes
const styles = {
  success: 'border-emerald-500/30 text-emerald-400 bg-[#09090b]/95 shadow-emerald-500/10',
  error: 'border-red-500/30 text-red-400 bg-[#09090b]/95 shadow-red-500/10',
  info: 'border-blue-500/30 text-blue-400 bg-[#09090b]/95 shadow-blue-500/10',
  warning: 'border-amber-500/30 text-amber-400 bg-[#09090b]/95 shadow-amber-500/10'
};

const defaultIcons = {
  success: <CheckCircle size={18} strokeWidth={2.5} className="text-emerald-400" />,
  error: <XCircle size={18} strokeWidth={2.5} className="text-red-400" />,
  info: <Info size={18} strokeWidth={2.5} className="text-blue-400" />,
  warning: <AlertTriangle size={18} strokeWidth={2.5} className="text-amber-400" />
};

const Toast = ({ data, onClose }) => {
  const { type = 'info', title, message, body, icon } = data || {};

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose, data]);

  if (!data) return null;

  const displayTitle = title || message;
  const displayBody = body || (title ? message : null);

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto px-4 w-full max-w-md"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}
    >
      <div 
        onClick={onClose}
        className={`
        flex items-start gap-3.5 px-5 py-4 
        rounded-2xl border backdrop-blur-2xl 
        shadow-[0_20px_50px_rgba(0,0,0,0.8)]
        animate-in slide-in-from-top-6 fade-in duration-400 cursor-pointer
        ${styles[type] || styles.info}
      `}>
        <div className="pt-0.5 shrink-0">
          {icon ? <span className="text-lg leading-none">{icon}</span> : (defaultIcons[type] || defaultIcons.info)}
        </div>

        <div className="flex flex-col space-y-1 min-w-0 flex-1">
          {displayTitle && (
            <span className="text-[12px] font-black uppercase tracking-wider text-white leading-tight break-words">
              {displayTitle}
            </span>
          )}
          {displayBody && (
            <span className="text-[11px] font-medium text-zinc-300 leading-snug break-words">
              {displayBody}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;