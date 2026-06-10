import React from 'react';
import { Mic, MicOff, VideoIcon, VideoOff, X } from 'lucide-react';


export const VideoControls = ({ isMuted, isVideoOff, onToggleAudio, onToggleVideo, onClose }) => {
  return (
    <div className="flex items-center gap-6 md:gap-10 px-6 md:px-8 py-2 bg-black/40 backdrop-blur-3xl border border-transparent rounded-[2.5rem]">
      <button 
        onClick={onToggleAudio} 
        className={`flex items-center justify-center transition-all active:scale-90 ${isMuted ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
      >
        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
      
      <button 
        onClick={onClose} 
        className="px-6 md:px-10 h-10 md:h-12 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
      >
        <X size={16} strokeWidth={3} />
        <span className="hidden sm:block text-[9px] font-black uppercase tracking-[0.2em]">Finalizar</span>
      </button>

      <button 
        onClick={onToggleVideo} 
        className={`flex items-center justify-center transition-all active:scale-90 ${isVideoOff ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
      >
        {isVideoOff ? <VideoOff size={18} /> : <VideoIcon size={18} />}
      </button>
    </div>
  );
};
export default VideoControls;
