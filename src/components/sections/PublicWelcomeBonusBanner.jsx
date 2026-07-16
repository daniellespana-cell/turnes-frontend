import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TurnesButton from '../ui/TurnesButton';

const PublicWelcomeBonusBanner = () => {
    const navigate = useNavigate();

    return (
        <div className="col-span-full mt-10 p-1 relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/20 via-zinc-900 to-emerald-500/10 border border-emerald-500/20 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
            
            <div className="relative bg-zinc-950/50 backdrop-blur-md p-8 md:p-10 rounded-[22px] flex flex-col md:flex-row items-center gap-8">
                {/* Icon & Title */}
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <Gift size={14} />
                        Oferta para Nuevas Empresas
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                        Publica tu Primer Turno Temporal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Totalmente Gratis</span>
                    </h3>
                    
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl">
                        Crea la cuenta de tu negocio y completa tu perfil comercial. Te regalamos la comisión de conexión de tu primer candidato para un turno temporal. Prueba la velocidad y calidad de nuestro talento verificado sin ningún riesgo.
                    </p>
                </div>

                {/* Call to Action */}
                <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-3">
                    <TurnesButton
                        onClick={() => navigate('/registro')}
                        variant="primary"
                        size="lg"
                        className="w-full md:w-auto shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                        icon={ArrowRight}
                    >
                        Reclamar Turno Gratis
                    </TurnesButton>
                    <span className="text-xs text-zinc-500 font-medium">* Aplica exclusivamente para turnos temporales.</span>
                </div>
            </div>
        </div>
    );
};

export default PublicWelcomeBonusBanner;
