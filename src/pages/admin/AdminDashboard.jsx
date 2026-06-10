import React from 'react';
import { Clock, ChevronRight, Activity, CalendarDays } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import AdminStatCard from '../../components/admin/shared/AdminStatCard';

import { useNavigate } from 'react-router-dom';
import { Shield, Users, Briefcase, CheckCircle, TrendingUp } from 'lucide-react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { ADMIN_NAV_ACTIONS } from '../../domain/admin.config';

const ICON_MAP = { Shield, Users, TrendingUp };

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { metrics, pendingQueue, loading, dateFilter, setDateFilter } = useAdminDashboard();

    if (loading) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                <Spinner size="xl" variant="blue" text="Sincronizando Módulos..." />
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto font-manrope">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header + Date Filter */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 mt-4">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity size={12} /> Sistemas Operativos (Datos Reales Puros)
                        </p>
                        <h1 className="text-4xl font-black tracking-tight text-white">
                            Centro de <span className="text-zinc-500">Mando</span>
                        </h1>
                    </div>
                    <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5 relative min-w-[160px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><CalendarDays size={14} className="text-emerald-400" /></div>
                        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full appearance-none bg-transparent py-2 pl-9 pr-8 text-xs font-bold text-white focus:outline-none cursor-pointer">
                            <option value="today" className="bg-zinc-900">Hoy (24h)</option>
                            <option value="week" className="bg-zinc-900">Últimos 7 Días</option>
                            <option value="month" className="bg-zinc-900">Mes Actual</option>
                            <option value="all" className="bg-zinc-900">Global en Red (Histórico)</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><ChevronRight size={14} className="text-zinc-500 rotate-90" /></div>
                    </div>
                </div>

                {/* Hero Metric */}
                <div className="w-full bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 relative flex flex-col justify-between">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-4 md:mb-0">
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">Densidad Transaccional <Activity size={16} className="text-blue-400" /></h2>
                            <p className="text-xs text-blue-400/80 font-medium">Volumen neto de usuarios registrados en base de datos.</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-5xl font-black text-blue-400">{metrics?.users?.total || 0}</p>
                            <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest mt-1">Cuentas Operativas Reales</p>
                        </div>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AdminStatCard icon={Users} label="Cuentas Estructurales" value={metrics?.users?.total || 0} color="text-blue-400" sub={`${metrics?.users?.empresas} Empresas · ${metrics?.users?.postulantes} Talentos`} />
                    <AdminStatCard icon={CheckCircle} label="Red Verificada" value={metrics?.users?.verificados || 0} color="text-emerald-400" sub="Auditoría KYC Aprobada" />
                    <AdminStatCard icon={Briefcase} label="Liquidez de Vacantes" value={metrics?.vacancies?.active || 0} color="text-amber-400" sub={`${metrics?.vacancies?.total} publicadas en total`} />
                    <AdminStatCard icon={Shield} label="Alertas de Seguridad" value={metrics?.verifications?.pending || 0} color="text-red-400" sub="Verificaciones Pendientes" />
                </div>

                {/* Quick Actions + Pending Queue */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ADMIN_NAV_ACTIONS.map(action => {
                            const ActionIcon = ICON_MAP[action.iconName] || Shield;
                            const badge = action.badgeKey === 'pendingVerifications' ? metrics?.verifications?.pending : null;
                            return (
                                <button key={action.path} onClick={() => navigate(action.path)} className="group text-left bg-zinc-900/40 border border-white/5 hover:border-white/20 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden h-32 flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/10 flex items-center justify-center`}><ActionIcon size={20} className={`text-${action.color}-400`} /></div>
                                        {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">{badge} EN COLA</span>}
                                    </div>
                                    <div><h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{action.label}</h3><p className="text-xs text-zinc-500 mt-1">{action.desc}</p></div>
                                    <ChevronRight size={16} className="absolute bottom-5 right-5 text-zinc-700 group-hover:text-white transition-colors group-hover:translate-x-1" />
                                </button>
                            );
                        })}
                    </div>

                    {/* Pending Queue Widget */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Clock size={14} className="text-amber-500" /> Acción Requerida</h2>
                            <button onClick={() => navigate('/admin/verificaciones')} className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors">VER TODO</button>
                        </div>
                        {pendingQueue.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-50 py-10"><Shield size={32} className="text-zinc-600 mb-2" /><p className="text-xs text-zinc-500 font-bold">Bandeja KYC Limpia</p></div>
                        ) : (
                            <div className="space-y-3">
                                {pendingQueue.map(req => (
                                    <button key={req.id} onClick={() => navigate(`/admin/verificaciones/${req.id}`)} className="w-full bg-black/40 hover:bg-zinc-800/80 border border-white/5 rounded-xl p-3 flex items-center gap-3 transition-colors text-left group">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><Shield size={14} className="text-blue-400" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{req.perfiles?.empresas?.nombre_comercial || req.perfiles?.nombre || 'Anónimo'}</p>
                                            <p className="text-[10px] text-zinc-500 truncate">{new Date(req.created_at).toLocaleDateString()} · {req.user_role}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-zinc-700 group-hover:text-white" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
