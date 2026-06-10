import React from 'react';
import VideoCallOverlay from './VideoCallOverlay';
import { CheckCircle2, X } from 'lucide-react';

import { useState, useEffect } from 'react';

const ChatOverlays = ({
  chat,
  candidato,
  fromVacante,
  isInVideoCall,
  setIsInVideoCall,
  roomUrl, // 🆕
  isClosed,
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  onExecutePayment
}) => {
  const {
    finanzas = {},
    registrarValidacionVideo
  } = chat || {};

  // Estado para el Toast de éxito
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Auto-cierre del Toast después de 4 segundos
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);



  const handleConfirmPayment = async () => {
    if (!onExecutePayment) return;

    // Ejecutamos la lógica del Hook
    const resultado = await onExecutePayment();

    if (resultado?.success) {
      setIsConfirmModalOpen(false);
      // 🔥 ACTIVAMOS EL TOAST AQUÍ
      setShowSuccessToast(true);
    }
  };

  const handleCloseVideo = (tiempo) => {
    setIsInVideoCall(false);
    if (tiempo && registrarValidacionVideo) {
      registrarValidacionVideo(tiempo);
    }
  };

  return (
    <>
      {/* --- TOAST FLOTANTE DE ÉXITO --- */}
      {showSuccessToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
          <div className="bg-[#0a0a0a] border border-emerald-500/30 text-white px-6 py-4 rounded-2xl  flex items-center gap-4 backdrop-blur-md pointer-events-auto">
            <div className="bg-emerald-500/10 p-2 rounded-full text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 className="text-[12px] font-black uppercase tracking-wider">Pago Exitoso</h4>
              <p className="text-[10px] text-zinc-400">Paso 2 desbloqueado. Puedes invitar a video.</p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="pl-4 text-zinc-600 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: VIDEO */}
      {isInVideoCall && !isClosed && (
        <VideoCallOverlay
          candidate={candidato}
          fromVacante={fromVacante}
          roomUrl={roomUrl}
          onClose={handleCloseVideo}
        />
      )}
    </>
  );
};

export default ChatOverlays;