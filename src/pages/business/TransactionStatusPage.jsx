import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FinanceService } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';

const TransactionStatusPage = () => {
    const { refreshSession } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, approved, declined, error, delayed
    const [ref, setRef] = useState(searchParams.get('id') || 'PENDING');

    const id = searchParams.get('id');
    const itemType = searchParams.get('itemType');
    const itemId = searchParams.get('itemId');

    // 🔄 Función de Verificación (SSOT)
    const verifyTransaction = useCallback(async () => {
        if (!id) {
            setStatus('error');
            return;
        }

        setStatus('verifying');
        try {
            // Esperamos a que la BD reciba el Webhook (max 60 segundos)
            await FinanceService.waitForTransaction(id);
            if (refreshSession) await refreshSession();
            setStatus('approved');
        } catch (error) {
            console.error("Verification Failed:", error);
            if (error.message?.includes('tiempo esperado')) {
                setStatus('delayed');
            } else {
                setStatus('error');
            }
        }
    }, [id]);

    useEffect(() => {
        verifyTransaction();
    }, [id, verifyTransaction]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-manrope">
            <div className="bg-[#0f0f10] border border-transparent rounded-3xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden">

                {/* Background Glow */}
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-b ${status === 'approved' ? 'from-emerald-500/20' : status === 'delayed' ? 'from-amber-500/20' : status === 'error' || status === 'declined' ? 'from-red-500/20' : 'from-blue-500/20'} to-transparent`} />

                {/* Icon */}
                <div className="relative z-10 flex justify-center">
                    {status === 'verifying' && (
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                            <Spinner size="lg" variant="blue" />
                        </div>
                    )}
                    {status === 'approved' && (
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={40} className="text-emerald-400" />
                        </div>
                    )}
                    {(status === 'declined' || status === 'error') && (
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                            <XCircle size={40} className="text-red-400" />
                        </div>
                    )}
                    {status === 'delayed' && (
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center">
                            <Spinner size="lg" variant="muted" />
                        </div>
                    )}
                </div>

                {/* Text */}
                <div className="relative z-10 space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                        {status === 'verifying' && 'Verificando Pago...'}
                        {status === 'approved' && '¡Pago Exitoso!'}
                        {status === 'delayed' && 'Aún procesando...'}
                        {status === 'declined' && 'Pago Rechazado'}
                        {status === 'error' && 'Error de Transacción'}
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Referencia: <span className="font-mono text-zinc-300">{ref}</span>
                    </p>
                    {status === 'verifying' && (
                        <p className="text-xs text-zinc-600 animate-pulse">
                            Confirmando transacción con Wompi...
                        </p>
                    )}
                    {status === 'approved' && (
                        <p className="text-sm text-zinc-400">
                            Los fondos han sido acreditados a tu billetera correctamente.
                        </p>
                    )}
                    {status === 'delayed' && (
                        <p className="text-sm text-zinc-400">
                            Tu transacción fue recibida por Wompi, pero el banco aún no nos ha enviado la confirmación final. <br />
                            <span className="text-amber-500/80 mt-2 block font-medium">Puedes reintentar la verificación ahora o volver más tarde.</span>
                        </p>
                    )}
                </div>

                <div className="relative z-10 pt-4 flex flex-col gap-3">
                    {status === 'delayed' && (
                        <button
                            onClick={verifyTransaction}
                            className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                            type="button"
                            aria-label="Acción">
                            Reintentar Verificación Ahora
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (status === 'approved' && itemType === 'service' && itemId === 'verify') {
                                navigate('/verificacion/documentos');
                            } else {
                                navigate('/dashboard/finanzas');
                            }
                        }}
                        className={`w-full py-3 ${status === 'approved' ? 'bg-white text-black' : 'bg-zinc-800 text-white'} font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                        type="button"
                        aria-label="Acción">
                        {(status === 'approved' && itemType === 'service' && itemId === 'verify') 
                            ? 'Siguiente paso: Subir Documentos' 
                            : 'Ir al Tablero de Finanzas'} <ArrowRight size={16} />
                    </button>
                    
                    {status === 'approved' && (
                        <button
                            onClick={() => window.print()}
                            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 underline"
                            type="button"
                            aria-label="Acción">
                            Descargar Comprobante
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionStatusPage;
