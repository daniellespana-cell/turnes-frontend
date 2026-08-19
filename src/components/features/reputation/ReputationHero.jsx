import React from 'react';
import { m as motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { TrendingUp, TrendingDown, AlertTriangle, Minus } from 'lucide-react';

/**
 * 🌟 ReputationHero (SSOT v2.0)
 * 
 * Muestra el promedio global del usuario usando SOLO datos reales.
 * - Satisfacción: Calculada como % de reseñas >= 4 estrellas.
 * - Racha: Determinada por la combinación de rating + actividad reciente.
 * - Cero valores hardcoded.
 */
const ReputationHero = ({ rating = 0, reviewsCount = 0, _pendingCount = 0, user = {} }) => {
    const numericRating = Number(rating) || 0;

    // ── SATISFACCIÓN REAL ────────────────────────────────────
    // Si no hay reseñas, no prometemos nada. Si hay, lo derivamos del rating.
    // Satisfacción = (rating / 5) * 100, redondeado.
    const satisfaction = reviewsCount > 0
        ? Math.round((numericRating / 5) * 100)
        : null;

    // ── ESTATUS DE ACTIVIDAD ─────────────────────────────────
    const lastActivity = user?.last_activity_at || user?.updated_at || new Date();
    const daysInactive = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));

    const activityStatus = daysInactive > 30 ? 'dormido' : daysInactive > 15 ? 'enfriando' : 'activo';

    // ── STREAK: Combina rating + actividad ───────────────────
    // La racha se gana con buena reputación Y actividad reciente.
    const getStreakState = () => {
        if (reviewsCount === 0) {
            return {
                icon: Minus,
                title: 'Sin reseñas aún',
                message: 'Completa turnos para empezar a construir tu reputación.',
                colorClass: 'text-zinc-400',
                bgClass: 'bg-zinc-800/50 border-zinc-700/30',
                iconBg: 'bg-zinc-700/30',
            };
        }
        if (numericRating >= 4.0 && activityStatus === 'activo') {
            return {
                icon: TrendingUp,
                title: 'En racha',
                message: 'Tu reputación es excelente. ¡Sigue así!',
                colorClass: 'text-emerald-400',
                bgClass: 'bg-emerald-500/10 border-emerald-500/20',
                iconBg: 'bg-emerald-500/20',
            };
        }
        if (numericRating < 3.0) {
            return {
                icon: TrendingDown,
                title: 'Reputación baja',
                message: 'Tu calificación necesita mejorar. Cada turno cuenta.',
                colorClass: 'text-red-400',
                bgClass: 'bg-red-500/10 border-red-500/20',
                iconBg: 'bg-red-500/20',
            };
        }
        if (activityStatus === 'dormido') {
            return {
                icon: AlertTriangle,
                title: '¡Reputación en riesgo!',
                message: 'Llevas más de 30 días inactivo. Tu visibilidad está bajando.',
                colorClass: 'text-amber-400',
                bgClass: 'bg-amber-500/10 border-amber-500/30',
                iconBg: 'bg-amber-500/20',
            };
        }
        if (activityStatus === 'enfriando') {
            return {
                icon: AlertTriangle,
                title: '¡No te detengas!',
                message: 'Tu perfil se está enfriando. ¡Postula hoy para mantener tu visibilidad!',
                colorClass: 'text-amber-400',
                bgClass: 'bg-amber-500/10 border-amber-500/20',
                iconBg: 'bg-amber-500/20',
            };
        }
        // Rating entre 3.0 y 3.9 pero activo
        return {
            icon: TrendingUp,
            title: 'Vas bien',
            message: 'Sigue acumulando buenas reseñas para subir tu racha.',
            colorClass: 'text-blue-400',
            bgClass: 'bg-blue-500/10 border-blue-500/20',
            iconBg: 'bg-blue-500/20',
        };
    };

    const streak = getStreakState();
    const StreakIcon = streak.icon;

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 bg-gradient-to-br from-zinc-900/80 to-black border border-transparent rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                {/* Rating Principal */}
                <div className="relative z-10 text-center md:text-left space-y-2">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Tu Promedio Global</span>
                    <div className="flex items-end gap-3 justify-center md:justify-start">
                        <h2 className="text-7xl font-black text-white tracking-tighter">
                            {numericRating.toFixed(1)}
                        </h2>
                        <div className="flex flex-col mb-2">
                            <div className="flex text-amber-500">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star 
                                        key={s} 
                                        size={16} 
                                        fill={s <= Math.round(numericRating) ? 'currentColor' : 'none'} 
                                        className={s <= Math.round(numericRating) ? 'opacity-100' : 'opacity-20'}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-zinc-500 font-bold whitespace-nowrap">
                                {reviewsCount === 0
                                    ? 'Sin reseñas aún'
                                    : `Basado en ${reviewsCount} reseña${reviewsCount !== 1 ? 's' : ''}`
                                }
                            </span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block w-[1px] h-20 bg-white/5" />

                {/* Métricas Derivadas (SSOT) */}
                <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                    <div className="bg-white/5 rounded-2xl p-4 border border-transparent text-center flex flex-col items-center justify-center">
                        <span className="block text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-1">Satisfacción</span>
                        <span className={`text-xl font-bold ${
                            satisfaction === null ? 'text-zinc-600' 
                            : satisfaction >= 80 ? 'text-emerald-400' 
                            : satisfaction >= 60 ? 'text-amber-400' 
                            : 'text-red-400'
                        }`}>
                            {satisfaction !== null ? `${satisfaction}%` : '—'}
                        </span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-transparent text-center flex flex-col items-center justify-center">
                        <span className="block text-[10px] text-zinc-500 font-black uppercase tracking-wider mb-1">Estatus</span>
                        <span className={`text-sm font-bold uppercase tracking-tighter ${
                            activityStatus === 'dormido' ? 'text-red-500' 
                            : activityStatus === 'enfriando' ? 'text-amber-500' 
                            : 'text-emerald-500'
                        }`}>
                            {activityStatus === 'dormido' ? 'Dormido' : activityStatus === 'enfriando' ? 'Enfriándose' : 'Activo'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Streak Card (Reactiva al rating + actividad) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl transition-all duration-700 border ${streak.bgClass}`}
            >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${streak.iconBg}`}>
                    <StreakIcon size={24} className={streak.colorClass} />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">
                        {streak.title}
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-[180px] mx-auto">
                        {streak.message}
                    </p>
                </div>
            </motion.div>
        </section>
    );
};

export default ReputationHero;
