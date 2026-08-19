import React from 'react';
import { ShieldCheck, CreditCard } from 'lucide-react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import financeService, { formatCurrency } from '../../services/financeService';
import paymentService from '../../services/paymentService';
import { useToast } from '../../context/ToastContext'; // 🚀 Importado para feedback real

const CardPaymentMethod = ({ user, item, _handleSuccess }) => {
    const navigate = useNavigate();
    const { showToast } = useToast(); // 🚀 Feedback visible para el usuario
    const [isProcessing, setIsProcessing] = useState(false);

    const handleWompiPayment = async () => {
        setIsProcessing(true);
        try {
            // Generar referencia inteligente para que el Webhook despache el Plan/Servicio correcto
            const itemId = item.type === 'plan' ? item.slug : item.id;
            const transactionData = await financeService.prepareWompiTransaction(
                item.rawPrice,
                user?.email,
                user?.id,
                item.type,
                itemId
            );

            if (!transactionData.reference || !transactionData.signature) {
                throw new Error("Datos de transacción incompletos");
            }

            // -------------------------------------------------------------------------------------------------
            // 🚀 SENIOR ARCHITECTURE NOTE (WOMPI MOBILE TESTING ON LAN)
            // -------------------------------------------------------------------------------------------------
            // 1. Wompi bloquea redirecciones asíncronas hacia dominios HTTP que no sean estrictamente 'localhost'.
            //    Si pasamos 'http://192.168.x.x/success' como redirectUrl, Wompi lanza un error interno silencioso de seguridad y no abre el popup.
            // 2. Para forzar a Wompi a abrir el IFrame (Modal) en móviles sobre la red LAN local, pasamos redirectUrl = undefined.
            // 3. ⚠️ ADVERTENCIA SAFARI/iOS: Las políticas de Apple ITP (Intelligent Tracking Prevention) en iOS bloquean 
            //    las cookies de terceros en los Iframes (como el de Wompi) en entornos no-HTTPS.
            //    Esto causa que, al darle a Pagar en el iPhone local, el API interno de Wompi falle con "Error desconocido".
            //    Solución total en Producción: Existirá HTTPS -> Existirá redirectUrl válido -> Wompi hará una redirección segura full-page saltándose el IFrame.
            // -------------------------------------------------------------------------------------------------
            const isLocalEnv = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' || 
                               window.location.hostname.startsWith('192.168.') ||
                               window.location.hostname.startsWith('10.');
                               
            // Al comprar un plan, lo enviamos al TransactionStatusPage correspondiente
            const redirectUrl = isLocalEnv 
                ? undefined 
                : `${window.location.origin}/dashboard/finanzas/success?reference=${transactionData.reference}&itemType=${item.type}&itemId=${itemId}`;

            await paymentService.openWidget({
                amountInCents: transactionData.amountInCents,
                reference: transactionData.reference,
                email: user?.email,
                integritySignature: transactionData.signature,
                redirectUrl: redirectUrl,
                itemType: item.type,
                itemId: itemId
            });

        } catch (error) {
            console.error("Error al disparar Wompi:", error);
            // 🚀 SENIOR FIX: No morir en silencio. Si el celular pierde señal y Supabase hace Timeout, avisar.
            showToast("Error de conexión. Revisa tu internet o intenta de nuevo.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">
                    Pago Seguro Acreditado
                </h3>
                {item.type === 'plan' && (
                    <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md uppercase tracking-widest">Recomendado</span>
                )}
            </div>
            {user?.saldo > 0 && user.saldo < item.rawPrice && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center text-sm mb-6">
                    <div>
                        <span className="block text-amber-500 font-black uppercase tracking-widest text-[9px]">Saldo Parcial</span>
                        <span className="text-zinc-400 text-xs font-medium">Tienes {formatCurrency(user.saldo)} pero no es suficiente.</span>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/finanzas/recargar')}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                        type="button"
                        aria-label="Acción">
                        Recargar
                    </button>
                </div>
            )}
            <div className="bg-zinc-900/50 border border-transparent rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 text-zinc-400">
                    <CreditCard size={24} />
                </div>
                <h4 className="text-white font-medium text-lg">Pasarela Oficial Wompi</h4>
                <p className="text-sm text-zinc-400 leading-relaxed px-4">
                    Al proceder, se te redirigirá al portal seguro de Bancolombia Wompi para autorizar tu pago con Nequi, PSE o Tarjeta.
                </p>

                <button
                    onClick={handleWompiPayment}
                    disabled={isProcessing}
                    className={`mt-4 group relative overflow-hidden w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-white transition-all shadow-lg ${isProcessing ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-brand-primary active:scale-[0.98]'}`}
                    type="button"
                    aria-label="Acción">
                    {isProcessing ? (
                        <span>Procesando...</span>
                    ) : (
                        <>
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <span>Pagar de Forma Segura</span>
                        </>
                    )}
                </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-6 text-center leading-relaxed font-medium">
                {item.type === 'plan'
                    ? "Al usar tarjeta, tu suscripción se renovará automáticamente cada mes. Puedes cancelar cuando quieras desde tus ajustes."
                    : "Este es un pago único por el microservicio seleccionado. No se aplicarán cargos ocultos en el futuro."
                }
            </p>
        </div>
    );
};

export default CardPaymentMethod;
