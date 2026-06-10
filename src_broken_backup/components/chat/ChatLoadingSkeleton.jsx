
export const ChatLoadingSkeleton = () => {
  return (
    <div className="flex h-full overflow-hidden animate-pulse">

      {/* 1. SKELETON DEL CHAT (IZQUIERDA) */}
      <div className="flex-1 flex flex-col border-r border-white/5">
        {/* Header Skeleton */}
        <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900" />
            <div className="space-y-2">
              <div className="w-32 h-3 bg-zinc-900 rounded" />
              <div className="w-20 h-2 bg-zinc-900/50 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl" />
            <div className="w-10 h-10 bg-zinc-900 rounded-xl" />
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-8 space-y-8">
          <div className="flex justify-center">
            <div className="w-64 h-16 bg-blue-500/5 border border-blue-500/10 rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <div className="w-3/4 h-20 bg-zinc-900/40 rounded-2xl rounded-tl-none" />
          </div>
          <div className="flex justify-end">
            <div className="w-1/2 h-16 bg-zinc-900/80 rounded-2xl rounded-tr-none" />
          </div>
        </div>

        {/* Input Skeleton */}
        <div className="p-4 border-t border-white/5">
          <div className="w-full h-12 bg-zinc-900/50 rounded-xl" />
        </div>
      </div>

      {/* 2. SKELETON DEL SIDEBAR (DERECHA - HIDDEN IN MOBILE) */}
      <aside className="hidden lg:block w-80 xl:w-96 p-6 space-y-8 bg-[#050505]">
        <div className="space-y-4">
          <div className="w-24 h-2 bg-zinc-800 rounded" />
          <div className="w-full h-16 bg-zinc-900/50 rounded-xl border border-transparent" />
        </div>

        <div className="space-y-4">
          <div className="w-32 h-2 bg-zinc-800 rounded" />
          <div className="w-full h-64 bg-zinc-900/20 rounded-[2rem] border border-transparent relative overflow-hidden">
            {/* Efecto de barrido de escaneo */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-1/2 w-full animate-scan" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="w-full h-14 bg-zinc-800 rounded-2xl" />
          <div className="w-full h-14 bg-zinc-900 rounded-2xl border border-transparent" />
        </div>
      </aside>
    </div>
  );
};