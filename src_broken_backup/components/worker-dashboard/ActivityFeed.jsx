import { Bell, Send, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useActivityFeed } from '../../hooks/useActivityFeed';

const ICONS = {
    postulacion: { icon: Send, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    notification: { icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    review: { icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const timeAgo = (d) => {
    if (!d) return '';
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'Ahora';
    if (m < 60) return `hace ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h}h`;
    return `hace ${Math.floor(h / 24)}d`;
};

/**
 * ActivityFeed: Interfaz Pura de Actividad.
 * No gestiona datos. No tiene efectos secundarios de red.
 */
const ActivityFeed = () => {
    const { user } = useAuth();
    const { items, isLoading } = useActivityFeed(user?.id);

    if (isLoading) {
        return (
            <div className="bg-zinc-900/40 rounded-3xl ring-1 ring-white/5 p-5 space-y-3 animate-pulse">
                <div className="h-3 w-32 bg-zinc-800 rounded-lg" />
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-zinc-800/50 rounded-xl" />)}
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="bg-zinc-900/40 rounded-3xl ring-1 ring-white/5 p-6 text-center">
                <Clock size={20} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">Tu actividad aparecerá aquí</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }} 
            className="bg-zinc-900/40 rounded-3xl ring-1 ring-white/5 p-5 space-y-3"
        >
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Bell size={12} className="text-amber-400" /> Actividad Reciente
            </h3>
            <div className="space-y-1">
                {items.map((a, i) => {
                    const c = ICONS[a.type] || ICONS.notification;
                    const Icon = c.icon;
                    return (
                        <motion.div 
                            key={a.id} 
                            initial={{ opacity: 0, x: -8 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: 0.6 + i * 0.08 }} 
                            className="flex items-start gap-3 py-2"
                        >
                            <div className="flex flex-col items-center gap-1 pt-0.5">
                                <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                                    <Icon size={13} className={c.color} />
                                </div>
                                {i < items.length - 1 && <div className="w-px h-4 bg-zinc-800" />}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-[11px] text-zinc-300 font-medium leading-snug line-clamp-2">{a.text}</p>
                                <p className="text-[9px] text-zinc-600 font-medium mt-0.5">{timeAgo(a.time)}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default ActivityFeed;
