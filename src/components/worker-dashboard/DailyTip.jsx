import React from 'react';
import { motion } from 'framer-motion';

import { useMemo } from 'react';
import { UserCircle, Zap, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../ui/Skeleton';

const TIPS = [
    { condition: (s) => (s?.profileCompletion || 0) < 80, icon: UserCircle, color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/5', border: 'border-amber-500/15', text: 'Completa tu perfil para aparecer en 3× más búsquedas de empresas.', cta: 'Completar Perfil', route: '/perfil' },
    { condition: (s) => (s?.totalShifts || 0) === 0, icon: Zap, color: 'text-blue-400', bg: 'from-blue-500/10 to-cyan-500/5', border: 'border-blue-500/15', text: '¡Postúlate a tu primer turno! Las empresas verificadas te esperan.', cta: 'Explorar Vacantes', route: '/dashboard/explorar' },
    { condition: (s) => (s?.avgRating || 0) >= 4.5, icon: Star, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/5', border: 'border-emerald-500/15', text: '¡Tu reputación es excelente! Las empresas priorizan talentos como tú.', cta: null, route: null },
    { condition: () => true, icon: TrendingUp, color: 'text-purple-400', bg: 'from-purple-500/10 to-indigo-500/5', border: 'border-purple-500/15', text: 'Mantén tu perfil actualizado para recibir mejores ofertas cada semana.', cta: 'Ver Perfil', route: '/perfil' },
];

const DailyTip = ({ stats, loading }) => {
    const navigate = useNavigate();

    const tip = useMemo(() => {
        const dayIndex = new Date().getDay();
        // Buscar el primer tip cuya condición se cumpla, rotando por día
        const applicable = TIPS.filter(t => t.condition(stats));
        return applicable[dayIndex % applicable.length] || TIPS[TIPS.length - 1];
    }, [stats]);

    if (loading || !stats) return <Skeleton className="w-full h-24" />;

    const Icon = tip.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
            className={`bg-gradient-to-r ${tip.bg} border ${tip.border} rounded-2xl p-4 flex items-start gap-3.5`}
        >
            <div className={`w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center shrink-0 ${tip.color}`}>
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tip del día</p>
                <p className="text-[12px] text-zinc-200 font-medium leading-relaxed">{tip.text}</p>
                {tip.cta && tip.route && (
                    <button
                        onClick={() => navigate(tip.route)}
                        className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${tip.color} hover:opacity-80 transition-opacity`}
                    >
                        {tip.cta} →
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default DailyTip;
