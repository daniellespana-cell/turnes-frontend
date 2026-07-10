import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

import { ShieldCheck, Search, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsContext } from '../../context/NotificationsContext';

const ELITE_BENEFITS = [
    {
        icon: Search,
        title: 'Prioridad en Búsquedas',
        desc: 'Tu empresa aparece primero cuando candidatos buscan empleo en tu sector.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
        icon: ShieldCheck,
        title: 'Badge Elite Verificado',
        desc: 'Tu perfil muestra el sello oficial que genera hasta 3× más postulaciones.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
        icon: Users,
        title: 'Acceso a Talento Top',
        desc: 'Candidatos con alta calificación priorizan empresas verificadas al postularse.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
        icon: TrendingUp,
        title: 'Mayor Tasa de Éxito',
        desc: 'Las empresas verificadas cierran procesos de contratación un 40% más rápido.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
    },
];

/**
 * EliteBanner — Solo visible cuando existe una notificación VERIFICATION_APPROVED no leída.
 * Al cerrar → marca esa notificación como leída en BD (persistencia real, sin localStorage).
 * Solo aplica a compradores del pase Elite.
 */
const EliteBanner = ({ userName }) => {
    const navigate = useNavigate();
    const { notifications, markAsRead } = useNotificationsContext();

    // La fuente de verdad: ¿hay una notificación de Elite sin leer?
    const eliteNote = notifications.find(
        (n) => n.tipo === 'VERIFICATION_APPROVED' && !n.leida
    );

    // Si no existe la notificación o ya fue leída → el banner no aparece
    const visible = Boolean(eliteNote);

    const handleDismiss = () => {
        if (eliteNote) {
            // Marca como leída en Supabase → persiste en BD, funciona en todos los dispositivos
            markAsRead(eliteNote.id);
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.section
                    initial={{ opacity: 0, y: -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                        opacity: 0,
                        overflow: 'hidden'
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-600/10 via-blue-500/5 to-cyan-500/8 p-6"
                >
                    {/* Glows decorativos */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-cyan-500/8 blur-2xl rounded-full pointer-events-none" />

                    {/* Botón cerrar — marca notificación como leída en BD */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/8 rounded-lg transition-colors z-10"
                        title="Entendido, no mostrar de nuevo"
                        type="button"
                        aria-label="Acción">
                        <X size={14} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5 relative z-10">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] shrink-0">
                            <ShieldCheck size={20} strokeWidth={2.5} className="text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base font-black text-white leading-tight">
                                    ¡Felicitaciones{userName ? `, ${userName.split(' ')[0]}` : ''}!
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest">
                                    Elite Verificado
                                </span>
                            </div>
                            <p className="text-xs text-blue-300/80 mt-0.5">
                                Tu empresa ya tiene el sello de confianza de Turnes. Esto es lo que cambia desde hoy:
                            </p>
                        </div>
                    </div>

                    {/* Grid de beneficios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10 mb-5">
                        {ELITE_BENEFITS.map(({ icon: Icon, title, desc, color, bg }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex items-start gap-3 rounded-2xl border p-3.5 ${bg}`}
                            >
                                <div className={`mt-0.5 shrink-0 ${color}`}>
                                    <Icon size={15} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-white leading-tight mb-0.5">{title}</p>
                                    <p className="text-[10px] text-zinc-400 leading-relaxed">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between relative z-10">
                        <p className="text-[10px] text-zinc-500">
                            Tu nuevo estatus ya es visible para todos los candidatos de Turnes.
                        </p>
                        <button
                            onClick={() => { handleDismiss(); navigate('/dashboard/perfil'); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-black hover:bg-blue-500/30 transition-colors whitespace-nowrap ml-4"
                            type="button"
                            aria-label="Acción">
                            Ver perfil <ChevronRight size={12} />
                        </button>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
};

export default EliteBanner;
