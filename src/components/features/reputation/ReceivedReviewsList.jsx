import React from 'react';
import { m as motion } from 'framer-motion';
import { Star, Building2 } from 'lucide-react';

import { AssetResolver } from '../../../utils/assetHelper';

const ReceivedReviewsList = ({ reviews = [], loading = false }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900/50 rounded-3xl animate-pulse" />)}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-zinc-900/30 border border-transparent rounded-[2rem] p-12 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-700">
                    <Star size={24} />
                </div>
                <p className="text-zinc-500 text-sm italic">Aún no has recibido valoraciones públicas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((rev, index) => (
                <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-[#0a0a0b] border border-transparent p-6 rounded-3xl transition-all group shadow-sm relative overflow-hidden ${rev.isLocked ? 'opacity-60 grayscale-[0.5] border-white/5 bg-zinc-900/20' : ''}`}
                >
                    {rev.isLocked && (
                        <div className="absolute inset-0 bg-brand-primary/5 backdrop-blur-[2px] flex items-center justify-center z-20">
                            <div className="bg-black/60 border border-brand-primary/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
                                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Pendiente de Desbloqueo</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                                {rev.author?.avatar_url ? (
                                    <img src={AssetResolver.getAvatar(rev.author.avatar_url)} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={20} className="text-zinc-600" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">{rev.author?.nombre_display || 'Empresa Turnes'}</h4>
                                <div className="flex text-amber-500 gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={10} 
                                            fill={i < rev.rating ? 'currentColor' : 'none'} 
                                            className={i < rev.rating ? 'opacity-100' : 'opacity-20'} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full border border-transparent">
                            {new Date(rev.created_at).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    {rev.comment && (
                        <p className="mt-4 text-zinc-400 text-sm leading-relaxed font-semibold italic">
                            "{rev.comment}"
                        </p>
                    )}
                </motion.div>
            ))}
        </div>
    );
};

export default ReceivedReviewsList;
