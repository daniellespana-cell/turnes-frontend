import React, { useState } from 'react';
import { Gift, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WelcomeBonusBanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showLegalModal, setShowLegalModal] = useState(false);

    if (!user || user.rol !== 'empresa') return null;

    const companyData = Array.isArray(user.empresas) ? user.empresas[0] : (user.empresas || {});
    const isProfileComplete = 
        companyData?.nombre_comercial && 
        companyData?.nit_rut && 
        companyData?.logo_url && 
        companyData?.sector_industrial;

    return (
        <>
            {/* Banner Section */}
            <div className="w-full bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-full shrink-0">
                        <Gift size={24} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                            Primer Turno Gratis
                            {isProfileComplete && <CheckCircle2 size={16} className="text-emerald-400" />}
                        </h3>
                        <p className="text-zinc-300 text-sm">
                            {isProfileComplete 
                                ? "¡Felicidades! Tu perfil está al 100%. Tu primera contratación será totalmente gratuita (descuento automático al contratar)."
                                : "Completa el 100% de tu perfil de empresa (incluyendo logo y NIT) para desbloquear tu primera contratación totalmente gratis."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                    {!isProfileComplete && (
                        <button
                            onClick={() => navigate('/dashboard/perfil')}
                            className="px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 hover:scale-105"
                        >
                            Completar Perfil
                        </button>
                    )}
                    <button
                        onClick={() => setShowLegalModal(true)}
                        className="px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                        <Info size={12} /> Ver Condiciones
                    </button>
                </div>
            </div>

            {/* Legal Modal */}
            {showLegalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
                        
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                            <Gift size={120} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <Info size={20} className="text-emerald-400" />
                                </div>
                                <h3 className="text-white font-bold text-lg">Términos y Condiciones</h3>
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed font-medium">
                                "El beneficio de 5,000 COP es un descuento exclusivo aplicado automáticamente en la primera contratación dentro de Turnes, siempre que el perfil de la empresa esté al 100% completo. En ningún caso es canjeable por dinero en efectivo ni transferible a cuentas bancarias."
                            </div>
                            
                            <button
                                onClick={() => setShowLegalModal(false)}
                                className="w-full py-3 px-4 rounded-xl font-bold uppercase text-[11px] tracking-widest text-zinc-400 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WelcomeBonusBanner;
