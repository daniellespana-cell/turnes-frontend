import React from 'react';
import { Timer, Lock, ShieldCheck } from 'lucide-react';
import Spinner from '../ui/Spinner';

import { useState, useEffect, useRef } from 'react';
import { logger } from '../../utils/logger';

/**
 * 🎥 VIDEOCALL OVERLAY (Senior Production Edition)
 * Blindado contra contextos inseguros y colapsos de layout.
 */
export const VideoCallOverlay = ({ candidate, fromVacante, roomUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isInsecure, setIsInsecure] = useState(false);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false); // 🆕 Feedback de conexión
  const iframeRef = useRef(null);

  // 1. ESCUCHAR EVENTOS DEL IFRAME (Daily.co postMessage API)
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.event === 'participant-joined' && !e.data?.participant?.local) {
        logger.info("👥 [VIDEO] Participante remoto conectado");
        setIsRemoteConnected(true);
      }
      if (e.data?.event === 'participant-left' && !e.data?.participant?.local) {
        setIsRemoteConnected(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    
    // 🛡️ SENIOR DIAGNOSTIC: Detectar si el navegador bloqueará la cámara por falta de HTTPS en móvil
    if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
      setIsInsecure(true);
    }

    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHangup = () => {
    onClose(formatTime(seconds));
  };

  const handleIframeLoad = () => {
    logger.info("📺 [VIDEO_OVERLAY] Daily.co Iframe cargado.");
    setIsLoading(false);
  };

  // 🚨 UI de Error para Contexto Inseguro (HTTP en móviles)
  if (isInsecure) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#050505] flex flex-col items-center justify-center p-8 text-center font-manrope">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
          <ShieldCheck size={40} className="text-red-500" />
        </div>
        <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-4">Conexión Insegura</h3>
        <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xs uppercase tracking-widest opacity-80">
          Los navegadores móviles bloquean la cámara en conexiones <span className="text-red-400 font-bold">HTTP</span>. 
          Para probar en móvil necesitas <span className="text-emerald-400 font-bold">HTTPS</span> o usar un túnel (ngrok).
        </p>
        <button 
          onClick={() => onClose()} 
          className="mt-10 px-8 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[.3em] transition-all"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] animate-in fade-in duration-500 flex flex-col font-manrope overflow-hidden select-none">
      
      {/* 1. HUD SUPERIOR */}
      <div className="shrink-0 p-6 md:p-8 flex justify-between items-start z-20 w-full bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex flex-col gap-2 min-w-0 max-w-[65%]">
          <div className="flex items-center gap-2.5">
            <div className="shrink-0 p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Lock size={10} className="text-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-black text-white uppercase tracking-[0.15em] truncate">Protocolo Biométrico</span>
              <span className="text-[6px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5 truncate opacity-60">REF: {fromVacante?.slice(0, 8)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/5 p-1 rounded-full w-fit max-w-full">
            <img src={candidate?.avatar} className="w-5 h-5 rounded-full border border-white/10 shrink-0 object-cover" alt="" />
            <div className="flex items-center gap-1.5 pr-2.5 min-w-0">
              <div className={`w-1 h-1 rounded-full ${isRemoteConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'} shrink-0`} />
              <span className={`text-[7px] font-black uppercase tracking-widest truncate ${isRemoteConnected ? 'text-emerald-500' : 'text-zinc-600'}`}>
                {isRemoteConnected ? candidate?.name : 'Esperando al postulante...'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-xl flex items-center gap-2 shrink-0">
          <Timer size={8} className="text-zinc-500" />
          <span className="text-[9px] font-mono font-black text-white tabular-nums">{formatTime(seconds)}</span>
        </div>
      </div>

      {/* 2. ÁREA DE VIDEO (Layout Full Height Blindado) */}
      <div className="flex-1 relative w-full overflow-hidden flex flex-col bg-black">
        
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505] gap-4">
            <div className="relative">
              <Spinner size="lg" variant="emerald" />
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-10 animate-pulse" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 animate-pulse">Sincronizando Feed...</span>
          </div>
        )}

        {roomUrl ? (
          <iframe
            ref={iframeRef}
            src={roomUrl}
            onLoad={handleIframeLoad}
            allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
            className="absolute inset-0 w-full h-full border-none"
            title="Turnes Video Session"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-600">
             <ShieldCheck size={40} className="opacity-20" />
             <span className="text-[10px] uppercase tracking-[0.2em]">Esperando Handshake...</span>
          </div>
        )}
      </div>

      {/* 3. CONTROLES FLOTANTES */}
      <div className="shrink-0 p-8 flex flex-col items-center gap-5 bg-gradient-to-t from-black to-transparent z-20">
        <button
          onClick={handleHangup}
          className="group relative px-10 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-[0_0_40px_rgba(220,38,38,0.2)] flex items-center gap-3"
        >
          Colgar
        </button>

        <div className="flex items-center gap-2 opacity-20 select-none">
          <ShieldCheck size={8} className="text-zinc-500" />
          <span className="text-[6px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center">Encrypted Peer-to-Peer Validation Protocol</span>
        </div>
      </div>

      {/* Efecto Scanline */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-5 z-10" />
    </div>
  );
};
export default VideoCallOverlay;
