import React from 'react';
import { m as motion } from 'framer-motion';
import { Building2, X } from 'lucide-react';


const PendingRatingsList = ({ pendingRatings = [], onRate, onDismiss }) => {
    return (
        <div className="space-y-4">
            {pendingRatings.length === 0 ? (
                <div className="bg-white/5 border border-transparent rounded-3xl p-8 text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-relaxed">
                        Estás al día.<br />No tienes Empresas pendientes por calificar.
                    </p>
                </div>
            ) : (
                pendingRatings.map((app) => (
                    <motion.div
                        key={app.id}
                        whileHover={{ x: 4 }}
                        className="bg-zinc-900/50 border border-transparent p-5 rounded-3xl space-y-4 shadow-lg group relative"
                    >
                        {/* 🚀 Senior Dismiss Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(app.id);
                            }}
                            className="absolute top-4 right-4 p-1.5 text-zinc-700 hover:text-white hover:bg-white/5 rounded-full transition-all"
                            title="Descartar esta calificación"
                            type="button">
                            <X size={14} />
                        </button>

                        <div className="flex gap-3 pr-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 transition-colors group-hover:bg-brand-primary/20">
                                <Building2 size={18} />
                            </div>
                            <div className="min-w-0">
                                <h5 className="text-[11px] font-black text-white uppercase tracking-wider truncate">
                                    {app.role}
                                </h5>
                                <p className="text-[10px] text-zinc-500 truncate font-semibold">
                                    {app.company}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onRate(app)}
                            className="w-full py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary hover:text-white transition-all  shadow-black/20 active:scale-95"
                            type="button"
                            aria-label="Acción">
                            Calificar Empresa
                        </button>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default PendingRatingsList;
