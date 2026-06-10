
/**
 * SolutionCard: El átomo visual de SolutionsLobby.
 * Mantiene la estética Premium 2026 y animaciones de alta gama.
 */
const SolutionCard = ({ serv, index, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17, delay: index * 0.1 }}
            onClick={() => onClick(serv)}
            className={`group relative bg-[#050505] border border-transparent p-6 rounded-[2rem] hover:${serv.borderColor} transition-colors flex flex-col justify-between h-full overflow-hidden cursor-pointer shadow-lg`}
        >
            {/* Super Vibrant Glow (JobToday Style) */}
            <div className={`absolute -top-24 -right-24 w-56 h-56 ${serv.bgColor} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

            <div className="relative z-10 pointer-events-none">
                <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`w-12 h-12 ${serv.bgColor} ${serv.borderColor} border rounded-2xl flex items-center justify-center mb-6 shadow-inner`}
                >
                    <serv.icon size={22} className={serv.color} />
                </motion.div>

                <h4 className="text-[15px] font-black text-white uppercase tracking-wider mb-2 antialiased">
                    {serv.title}
                </h4>

                <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-8">
                    {serv.desc}
                </p>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Inversión Final</span>
                        <span className="text-lg font-black text-white tabular-nums drop-shadow-md">
                            {serv.price === 0 ? (
                                <span className="text-emerald-400">INCLUIDO</span>
                            ) : (
                                `$${serv.price.toLocaleString()}`
                            )}
                        </span>
                    </div>
                </div>

                {/* Feedback Visual del Botón */}
                <div
                    className={`w-full py-3 bg-zinc-900 border ${serv.borderColor} text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-zinc-800 shadow-inner group-hover:${serv.color} pointer-events-none`}
                >
                    <span>{serv.label}</span>
                    <ChevronRight size={14} strokeWidth={3} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
            </div>
        </motion.div>
    );
};

export default SolutionCard;
