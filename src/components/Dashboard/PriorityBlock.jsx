import { Zap, ChevronRight, Users, Clock } from 'lucide-react';


export const PriorityBlock = ({ items }) => (
  <section className="bg-zinc-900/20 border border-transparent rounded-2xl p-5 relative overflow-hidden transition-all duration-500 hover:bg-zinc-900/30">
    <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
      <Zap size={50} className="text-white" />
    </div>

    <div className="relative z-10 space-y-3">
      {/* TÍTULO NANO-TEXT */}
      <h2 className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-1 antialiased">
        Prioridad Hoy
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 bg-black/20 border border-transparent rounded-xl hover:bg-white/[0.03]  transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/10 group-hover:bg-${item.color}-500/20 transition-colors`}>
                {item.type === 'postulation' ? (
                  <Users size={12} className="text-emerald-500" />
                ) : (
                  <Clock size={12} className="text-orange-500" />
                )}
              </div>

              <p className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors tracking-tight">
                {item.title}
              </p>
            </div>

            <ChevronRight
              size={12}
              className="text-zinc-700 group-hover:text-zinc-400 transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default PriorityBlock;
