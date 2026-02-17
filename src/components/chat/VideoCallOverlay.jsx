import React, { useState, useEffect, useRef } from 'react';
import { Timer, Lock, ShieldCheck } from 'lucide-react';
import { VideoPreview } from './VideoPreview';
import { VideoControls } from './VideoControls';

export const VideoCallOverlay = ({ candidate, fromVacante, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Error acceso periféricos:", err); }
    }
    enableCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const triggerFlicker = () => {
    setIsFlickering(true);
    setTimeout(() => setIsFlickering(false), 250);
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        triggerFlicker();
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        if (videoTrack.enabled && videoRef.current) {
          videoRef.current.play().catch(e => console.error(e));
        }
      }
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] animate-in fade-in duration-500 flex flex-col font-manrope overflow-hidden select-none">
      
      {/* 1. BACKGROUND FEED (Estética Institucional) */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <video autoPlay muted loop className="w-full h-full object-cover opacity-40 blur-[1px]">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
      </div>

      {/* 2. HUD SUPERIOR */}
      <div className="relative p-4 md:p-10 flex justify-between items-start z-10 w-full max-w-full">
        <div className="flex flex-col gap-3 min-w-0 max-w-[60%]">
          <div className="flex items-center gap-2.5">
            <div className="shrink-0 p-2 bg-white/5 border border-white/10 rounded-xl">
              <Lock size={12} className="text-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-black text-white uppercase tracking-[0.15em] truncate">Protocolo de Validación</span>
              <span className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mt-1 truncate">ID: T-{fromVacante?.slice(0, 8)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/5 p-1 rounded-full w-fit max-w-full">
            <img src={candidate?.avatar} className="w-6 h-6 rounded-full border border-white/10 shrink-0" alt="" />
            <div className="flex items-center gap-1.5 pr-3 min-w-0">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest truncate">Live: {candidate?.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2 rounded-2xl flex items-center gap-2 shrink-0">
          <Timer size={10} className="text-zinc-500" />
          <span className="text-[10px] font-mono font-black text-white tabular-nums">{formatTime(seconds)}</span>
        </div>
      </div>

      {/* 3. TU PREVIEW (Átomo Refactorizado) */}
      <VideoPreview 
        videoRef={videoRef}
        isVideoOff={isVideoOff}
        isFlickering={isFlickering}
        isMuted={isMuted}
      />

      {/* 4. CONTROLES (Átomo Refactorizado) */}
      <div className="mt-auto relative p-6 md:p-12 z-10 flex flex-col items-center gap-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <VideoControls 
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onClose={() => onClose(formatTime(seconds))}
        />

        <div className="flex items-center gap-3 opacity-20 select-none">
          <ShieldCheck size={10} className="text-zinc-500" />
          <span className="text-[7px] font-black uppercase tracking-[0.3em] text-zinc-500">Secure Biometric Session</span>
        </div>
      </div>
    </div>
  );
};