import React from 'react';
import { Crown, Clock, ShieldAlert } from 'lucide-react';
import Spinner from '../../ui/Spinner';
import ConfirmationModal from '../../common/ConfirmationModal';

import { useState } from 'react';
import { useSubscription } from '../../../hooks/useSubscription';

/**
 * SubscriptionTab: Interfaz Pura de Suscripciones (SSOT).
 * No gestiona datos. No tiene efectos secundarios.
 * Recibe toda la inteligencia del hook useSubscription.
 */
const SubscriptionTab = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downgradeTarget, setDowngradeTarget] = useState('micro');
    const { 
        currentPlan, 
        isPaidPlan, 
        isCanceled, 
        expiresAt, 
        loading, 
        isToggling, 
        toggleRenewal, 
        downgradeToMicro,
        downgradeToBasic
    } = useSubscription();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Spinner size="xl" variant="emerald" />
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Sincronizando Suscripción...</p>
            </div>
        );
    }

    const formatExpirationDate = (dateString) => {
        if (!dateString) return "No disponible";
        const d = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-manrope">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Facturación y Suscripción</h2>
                <p className="text-zinc-400 text-sm">Gestiona la renovación de tu plan actual.</p>
            </div>

            <div className="bg-white/5 border border-transparent rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                
                {/* Cabecera del Plan Actual */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isCanceled ? 'bg-amber-500/10 text-amber-500' : isPaidPlan ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-900 text-zinc-400'}`}>
                            <Crown size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">{currentPlan?.nombre}</h3>
                            <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: isPaidPlan ? (isCanceled ? '#f59e0b' : '#34d399') : '#a1a1aa' }}>
                                {isPaidPlan ? (isCanceled ? 'Cancelación Programada' : 'Suscripción Activa') : 'Plan Gratuito'}
                            </p>
                        </div>
                    </div>
                </div>

                {isPaidPlan ? (
                    <>
                        <div className="bg-white/[0.02] border border-transparent rounded-xl p-5 flex gap-4">
                            <Clock size={20} className={`shrink-0 mt-0.5 ${isCanceled ? 'text-amber-500' : 'text-zinc-400'}`} />
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-zinc-200">Ciclo de Facturación</h4>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {isCanceled
                                        ? `Has cancelado tu plan, pero retendrás sus beneficios hasta el `
                                        : `Tu próxima renovación será procesada el `}
                                    <strong className="text-white">{formatExpirationDate(expiresAt)}</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Ajustes de Renovación */}
                        <div className="border-t border-white/5 pt-6 mt-6">
                            <h4 className="text-sm font-bold text-zinc-200 mb-4">Ajustes de Renovación</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-xl">
                                <div className="space-y-1 pr-6 flex-1">
                                    <p className="text-sm font-bold text-white">Renovación Automática</p>
                                    <p className="text-xs text-zinc-500">
                                        {isCanceled
                                            ? "Tu plan bajará a Básico al finalizar el período."
                                            : "Mantén tu suscripción activa mes a mes sin interrupciones."}
                                    </p>
                                </div>
                                <button
                                    onClick={toggleRenewal}
                                    disabled={isToggling}
                                    className={`flex items-center justify-center px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${isToggling ? 'opacity-50' : 'active:scale-95'} ${isCanceled ? 'bg-emerald-500 text-black' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                >
                                    {isToggling ? '...' : isCanceled ? 'Reactivar' : 'Desactivar auto-renovación'}
                                </button>
                            </div>
                        </div>

                        {/* Gestión de Nivel */}
                        {(currentPlan?.slug === 'pro' || currentPlan?.slug === 'micro') && (
                            <div className="border-t border-white/5 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-zinc-200 mb-4">Gestión de Nivel</h4>
                                
                                {currentPlan?.slug === 'pro' && (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 mb-4">
                                        <div className="space-y-1 pr-6 flex-1">
                                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                                Cambiar al Plan Micro
                                                <span className="bg-blue-500/20 text-blue-400 text-[9px] px-2 py-0.5 rounded-full uppercase">Mejor Precio</span>
                                            </p>
                                            <p className="text-xs text-zinc-500 italic">
                                                Baja de nivel instantáneamente y ajusta tus costos mensuales.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setDowngradeTarget('micro');
                                                setIsModalOpen(true);
                                            }}
                                            disabled={isToggling}
                                            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
                                        >
                                            {isToggling && downgradeTarget === 'micro' ? 'Cambiando...' : 'Bajar a Micro'}
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-500/5 p-4 rounded-xl border border-zinc-500/10">
                                    <div className="space-y-1 pr-6 flex-1">
                                        <p className="text-sm font-bold text-white flex items-center gap-2">
                                            Bajar al Plan Básico
                                        </p>
                                        <p className="text-xs text-zinc-500 italic">
                                            El cambio se aplicará al finalizar tu ciclo de facturación actual.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setDowngradeTarget('basic');
                                            setIsModalOpen(true);
                                        }}
                                        disabled={isToggling}
                                        className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
                                    >
                                        {isToggling && downgradeTarget === 'basic' ? 'Cambiando...' : 'Bajar a Básico'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white/[0.02] border border-transparent rounded-xl p-5 flex gap-4 items-center">
                        <ShieldAlert size={20} className="text-zinc-500 shrink-0" />
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            No tienes ninguna suscripción de pago activa. Visita las opciones de actualización para mejorar tus beneficios.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de Confirmación Premium */}
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    setIsModalOpen(false);
                    if (downgradeTarget === 'micro') downgradeToMicro();
                    if (downgradeTarget === 'basic') downgradeToBasic();
                }}
                title={downgradeTarget === 'micro' ? "¿Confirmar Downgrade a Micro?" : "¿Confirmar Downgrade a Básico?"}
                message={downgradeTarget === 'micro' 
                    ? "Tu nivel de suscripción bajará al Plan Micro inmediatamente. Los beneficios del Plan Pro se desactivarán y tu ciclo de facturación se ajustará."
                    : `Tu plan bajará a Básico el ${formatExpirationDate(expiresAt)}. Conservarás tus beneficios actuales hasta esa fecha.`
                }
                confirmText={`Bajar a ${downgradeTarget === 'micro' ? 'Micro' : 'Básico'}`}
                type="info"
            />
        </div>
    );
};

export default SubscriptionTab;
