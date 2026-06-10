import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/common/PageHeader';
import FinanceHero from '../../components/finance/FinanceHero';
import TransactionList from '../../components/finance/TransactionList';

import { Wallet } from 'lucide-react';
import { useWorkerFinance } from '../../hooks/useWorkerFinance';
import { useAuth } from '../../context/AuthContext';

// Modular Architecture

const WorkerFinance = () => {
    const { user } = useAuth();
    const isBusiness = user?.role === 'empresa';

    const {
        history,
        stats,
        loading,
        hasMore,
        loadMore,
        isLoadingMore,
        error,
        refetch
    } = useWorkerFinance();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Spinner size="xl" variant="emerald" text="Calculando estimaciones..." />
            </div>
        );
    }

    if (error && history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 px-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg">Huston, tenemos un problema</h3>
                    <p className="text-zinc-500 text-sm max-w-[250px] mx-auto">No pudimos conectar con los registros de turnos. Revisa tu conexión.</p>
                </div>
                <button 
                    onClick={() => refetch()}
                    className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                    Reintentar Conexión
                </button>
            </div>
        );
    }

    return (
        <div className="font-manrope pb-24 animate-fade-in space-y-6 max-w-lg mx-auto md:max-w-4xl px-0 md:px-0">
            {/* Standard Global Page Header */}
            <PageHeader 
                icon={Wallet} 
                title={isBusiness ? 'Mi' : 'Mi'} 
                highlight={isBusiness ? 'Historial de Pagos' : 'Historial de Ingresos'} 
                subtitle={isBusiness ? 'Registro de comisiones e inversiones en talento' : 'Estimación basada en tus turnos finalizados'} 
            />

            <div className="px-4 space-y-6">
                
                {/* 🛡️ Banner Aclaratorio Premium (Zero-Trust) */}
                {!isBusiness && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
                        <div className="mt-0.5 shrink-0 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <Info size={16} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-emerald-400 mb-1">Transparencia Financiera</h4>
                            <p className="text-xs font-medium text-emerald-400/80 leading-relaxed">
                                Turnes no retiene tu dinero. Los pagos los recibes directamente de la empresa al finalizar tu turno. Este panel es puramente estadístico.
                            </p>
                        </div>
                    </div>
                )}

                {/* Hero Metric */}
                <FinanceHero 
                    totalEarned={stats?.totalEarned} 
                    label={isBusiness ? 'Total Invertido en Talento' : 'Ganancias Estimadas Totales'}
                />

                {/* History List */}
                <TransactionList 
                    history={history} 
                    hasMore={hasMore} 
                    loadMore={loadMore} 
                    isLoadingMore={isLoadingMore} 
                />
            </div>
        </div>
    );
};

export default WorkerFinance;
