
export const VideoPreview = ({ videoRef, isVideoOff, isFlickering, isMuted }) => {
  return (
    <div className="absolute right-4 bottom-36 md:right-10 md:bottom-44 w-24 h-36 md:w-28 md:h-40 bg-zinc-950 rounded-[1.5rem] md:rounded-[2rem] border border-white/20 overflow-hidden  z-20 transition-all">
      <video 
        ref={videoRef} 
        autoPlay playsInline muted 
        className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-70'}`} 
      />
      
      {(isFlickering || isVideoOff) && (
        <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
          <VideoOff size={20} className="text-white/5 relative z-0" />
        </div>
      )}

      {isMuted && (
        <div className="absolute top-2 right-2 p-1.5 bg-red-600/80 backdrop-blur-sm rounded-lg z-30 animate-in zoom-in duration-300">
          <MicOff size={10} className="text-white" />
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center p-1 bg-black/60 backdrop-blur-md rounded-lg border border-transparent z-30">
        <span className="text-[6px] md:text-[7px] font-black text-white uppercase tracking-tighter truncate">Local Feed</span>
      </div>
    </div>
  );
};