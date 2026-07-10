import React from 'react';
import { m as motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

import { formatCurrency } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';

const MicroserviceCard = ({ service, handleUpgrade }) => {
    const { user } = useAuth();
    const isAcquired = service.id === 'verify' && user?.verificado;
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/30 border border-transparent rounded-2xl p-6 hover:bg-zinc-900/60 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{service.title}</h4>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-transparent uppercase tracking-wider">{service.target_audience}</span>
            </div>
            <p className="text-xs text-zinc-400 mb-6 h-10 line-clamp-2">{service.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-lg font-black text-white">{service.price == 0 ? "Variable" : formatCurrency(service.price).replace(',00', '')}</span>

                {isAcquired ? (
                    <button
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 text-[10px] uppercase tracking-wider flex items-center gap-1.5 opacity-80 cursor-not-allowed"
                        type="button"
                        aria-label="Acción">
                        <Check size={14} /> Adquirido
                    </button>
                ) : (
                    <button
                        onClick={() => handleUpgrade(service.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-white text-zinc-400 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.2)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)]"
                        type="button"
                        aria-label="Acción">
                        <ArrowRight size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default MicroserviceCard;