import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../config/routes.paths';
const activeRoles = ["Mesero", "Bartender", "Seguridad", "Logística", "Protocolo"];

const HeroSearch = () => {
    const navigate = useNavigate();
    const [placeholder, setPlaceholder] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);
    // TYPEWRITER EFFECT
    useEffect(() => {
        let pauseTimer = null;

        const handleType = () => {
            const i = loopNum % activeRoles.length;
            const fullText = activeRoles[i];

            setPlaceholder(isDeleting
                ? fullText.substring(0, placeholder.length - 1)
                : fullText.substring(0, placeholder.length + 1)
            );

            setTypingSpeed(isDeleting ? 50 : 150);

            if (!isDeleting && placeholder === fullText) {
                pauseTimer = setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && placeholder === '') {
                setIsDeleting(false);
                setLoopNum(prev => prev + 1);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => {
            clearTimeout(timer);
            if (pauseTimer) clearTimeout(pauseTimer);
        };
    }, [placeholder, isDeleting, loopNum, typingSpeed]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(PATHS.PUBLIC.REGISTER_COMPANY);
    };

    return (
        <div className="w-full max-w-2xl mx-auto my-10 font-manrope">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-4 text-center">
                ¿Qué talento buscas hoy?
            </h3>

            <form onSubmit={handleSearch} className="relative group">
                <input
                    id="hero-talent-search"
                    name="talentSearch"
                    type="text"
                    readOnly
                    aria-label="Buscar talento por especialidad o rol"
                    placeholder={`Ej: ${placeholder}|`}
                    className="w-full h-14 md:h-16 pl-6 pr-14 bg-[#0a0a0a] rounded-2xl border-2 border-emerald-500/50 hover:border-emerald-500 focus:border-emerald-400 text-white placeholder:text-zinc-500 text-lg outline-none transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] focus:shadow-[0_0_40px_rgba(16,185,129,0.25)] cursor-pointer"
                />

                <button
                    type="submit"
                    aria-label="Buscar talento"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-xl transition-all duration-300"
                >
                    <Search size={24} strokeWidth={2.5} />
                </button>
            </form>

            {/* DUAL CTA (B2B vs B2C) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 text-sm">
                <Link to={PATHS.PUBLIC.REGISTER_TALENT} className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-colors border border-zinc-700 hover:border-zinc-500 w-full sm:w-auto text-center">
                    Soy Talento, busco turnos
                </Link>
                <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <Link to={PATHS.PUBLIC.REGISTER_COMPANY} className="px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-full font-bold transition-colors border border-emerald-500/20 w-full sm:w-auto text-center">
                    Soy Empresa, busco personal
                </Link>
            </div>
        </div>
    );
};

export default HeroSearch;
