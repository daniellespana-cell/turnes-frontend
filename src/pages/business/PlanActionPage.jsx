import React from 'react';
import { ArrowLeft, LockIcon, CheckCircle } from 'lucide-react';
import PaymentSuccessOverlay from '../../components/checkout/PaymentSuccessOverlay';
import PlanSummaryCard from '../../components/checkout/PlanSummaryCard';
import WalletPaymentMethod from '../../components/checkout/WalletPaymentMethod';
import CardPaymentMethod from '../../components/checkout/CardPaymentMethod';

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { usePlanCheckout } from '../../hooks/usePlanCheckout';
import { useAuth } from '../../context/AuthContext';

// Componentes modularizados

const PlanActionPage = () => {
    const { planSlug } = useParams();
    const navigate = useNavigate();

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const { user } = useAuth();

    const {
        item, loading, error, paymentSuccess, handleSuccess,
        payWithWallet, isProcessingWallet, walletError
    } = usePlanCheckout(planSlug);

    // 💳 Evaluador de Saldo
    const hasSufficientBalance = user?.saldo >= (item?.rawPrice || Infinity);

    // Bloqueo Inteligente Anti-Duplicate
    const isAlreadyAcquired =
        ((item?.id === 'verify' || item?.title?.toLowerCase().includes('verificación')) && user?.verificado) ||
        (item?.type === 'plan' && user?.plan && user.plan.toLowerCase() === item?.title?.toLowerCase());

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md space-y-8 animate-pulse">
                    <div className="h-10 w-48 bg-white/5 rounded-full mx-auto" />
                    <div className="h-64 w-full bg-white/5 rounded-3xl" />
                </div>
                <p className="mt-8 text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Sincronizando Orden...</p>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-center">
                <LockIcon className="text-red-500 mb-6" size={32} />
                <h2 className="text-xl font-bold text-white mb-2">Error de Sincronización</h2>
                <button onClick={() => navigate(-1)} className="px-8 py-3 bg-white text-black font-bold rounded-xl mt-8">Volver</button>
            </div>
        );
    }

    return (
        <>
            <PaymentSuccessOverlay show={paymentSuccess} />

            <div className="w-full max-w-6xl mx-auto px-6 py-12 md:pl-20">
                <div className="mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-500 hover:text-white transition-all">
                        <ArrowLeft size={24} />
                    </button>
                </div>

                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-white">
                        Finalizar Compra <span className={`text-${item.accent}-400`}>Segura</span>
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400">Detalles de tu orden.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    <div className="lg:col-span-5 order-1">
                        <div className="lg:sticky lg:top-8">
                            <PlanSummaryCard item={item} />
                        </div>
                    </div>

                    <div className="lg:col-span-7 order-2 lg:pl-16">
                        {isAlreadyAcquired ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <CheckCircle size={32} className="text-emerald-500 mb-6" />
                                <h3 className="text-2xl font-black text-white mb-2">Producto Adquirido</h3>
                                <button onClick={() => navigate('/dashboard')} className="px-8 py-3 rounded-xl bg-white text-black font-bold mt-8">Volver al Tablero</button>
                            </div>
                        ) : (
                            <div className="md:pl-8 space-y-10">
                                {hasSufficientBalance && user?.role === 'empresa' && (
                                    <WalletPaymentMethod
                                        user={user}
                                        item={item}
                                        payWithWallet={payWithWallet}
                                        isProcessingWallet={isProcessingWallet}
                                        walletError={walletError}
                                    />
                                )}
                                <CardPaymentMethod user={user} item={item} handleSuccess={handleSuccess} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlanActionPage;