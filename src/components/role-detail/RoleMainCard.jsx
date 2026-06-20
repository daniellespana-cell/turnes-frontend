import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, Star, CheckCircle, ArrowRight } from 'lucide-react';
import TurnesButton from '../../ui/TurnesButton';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const RoleMainCard = ({ rol, shortSummary }) => {
    const navigate = useNavigate();

    return (
        <motion.div variants={fadeInUp} className="lg:col-span-2 bg-zinc-900/40 p-8 rounded-3xl transition-colors duration-500 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 gap-4">
                <div>
                    <span className="text-xs font-mono text-emerald-500 mb-1 block">EJEMPLO REAL</span>
                    <h2 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">{rol.job.title}</h2>
                </div>
                <span className="text-xl font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl">{rol.job.salary}</span>
            </div>

            <p className="text-base text-zinc-400 mb-8 leading-relaxed font-light">
                {shortSummary}
            </p>

            {/* Detalles del Rol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-zinc-400 mb-8 text-sm">
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-transparent">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><MapPin size={18} /></div>
                    <div><span className="block text-xs text-zinc-500 uppercase">Ubicación</span><span className="text-white font-medium">{rol.job.location}</span></div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-transparent">
                    <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400"><Clock size={18} /></div>
                    <div><span className="block text-xs text-zinc-500 uppercase">Duración</span><span className="text-white font-medium">{rol.job.hours}</span></div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-transparent">
                    <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400"><User size={18} /></div>
                    <div><span className="block text-xs text-zinc-500 uppercase">Modalidad</span><span className="text-white font-medium">Freelance / Turno</span></div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-transparent">
                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400"><Star size={18} /></div>
                    <div><span className="block text-xs text-zinc-500 uppercase">Calificación</span><span className="text-white font-medium">4.8/5.0</span></div>
                </div>
            </div>

            {/* Requisitos (Opcional) */}
            {rol.job.reqs && rol.job.reqs.length > 0 && (
                <>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-3">Requisitos Indispensables</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-zinc-400 text-sm mb-8">
                        {rol.job.reqs.map((req, index) => (
                            <li key={index} className="flex items-center gap-3">
                                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                <span>{req}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* CTA Postúlate */}
            <div className="mt-10 pt-8">
                <TurnesButton
                    onClick={() => navigate('/register?role=jobseeker')}
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    className="w-full md:w-fit"
                >
                    Aplicar a Turnos Como Este
                </TurnesButton>
                <p className="text-xs text-zinc-500 mt-3 text-center md:text-left">
                    Crea tu perfil gratis en 2 minutos. Sin comisiones ocultas.
                </p>
            </div>
        </motion.div>
    );
};

export default RoleMainCard;
