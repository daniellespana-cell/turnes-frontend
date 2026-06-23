import React from 'react';
import { motion } from 'framer-motion';
import { Info, ArrowRight } from 'lucide-react';
import TurnesButton from '../ui/TurnesButton';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const RoleBusinessCard = ({ rol }) => {
    const navigate = useNavigate();

    return (
        <motion.div variants={fadeInUp} className="lg:col-span-1 bg-zinc-900/40 p-8 rounded-3xl h-fit transition-colors duration-500">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg"><Info size={20} className="text-indigo-400" /></div>
                ¿Eres una Empresa?
            </h3>
            <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                ¿Necesitas un <strong>{rol.title}</strong> para este fin de semana? Publícalo ya y recibe candidatos verificados en minutos.
            </p>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <span>Sin contratos fijos ni papeleo.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <span>Pago instantáneo y seguro.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    <span>Garantía de cumplimiento.</span>
                </div>
            </div>

            <TurnesButton
                onClick={() => navigate('/precios')}
                variant="secondary"
                size="md"
                className="w-full"
                icon={ArrowRight}
            >
                Ver Planes de Empresa
            </TurnesButton>
        </motion.div>
    );
};

export default RoleBusinessCard;
