import { useState, useEffect } from 'react';
import { useAnimation } from 'framer-motion';

import repImg from '../../assets/roles/rep.jpg';
import baristaImg from '../../assets/roles/barista.jpg';
import meseroImg from '../../assets/roles/mesero.jpg';
import cocineroImg from '../../assets/roles/cocinero.jpg';
import bartenderImg from '../../assets/roles/bartender.jpg';
import ayudanteImg from '../../assets/roles/ayudante.jpg';

// Lista de Roles (Mock Data)
const jobRoles = [
    { title: "Chef de Repostería", img: repImg, slug: "reposteria" },
    { title: "Barista Profesional", img: baristaImg, slug: "barista" },
    { title: "Mesero de Finde", img: meseroImg, slug: "mesero" },
    { title: "Cocinero Rápido", img: cocineroImg, slug: "cocinero" },
    { title: "Bartender de Eventos", img: bartenderImg, slug: "bartender" },
    { title: "Ayudante de Cocina", img: ayudanteImg, slug: "ayudante" },
];

const carouselItems = [...jobRoles, ...jobRoles, ...jobRoles]; // Triple duplication for smoother infinite loop

const JobCarousel = () => {
    const controls = useAnimation();
    const [isHovered, setIsHovered] = useState(false);

    const marqueeAnimation = {
        x: ['0%', '-33.33%'], // Move 1/3 of the total width (since we tripled the data)
        transition: {
            duration: 30, // Slower, more elegant
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
        },
    };

    useEffect(() => {
        if (!isHovered) {
            controls.start(marqueeAnimation);
        } else {
            controls.stop();
        }
    }, [isHovered, controls]);

    return (
        <section id="roles-section" className="py-24 bg-zinc-950 relative overflow-hidden border-t border-white/5">

            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[20%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5 mb-4 inline-block">
                    Oportunidades Reales
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    Roles <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Más Buscados</span>
                </h2>
            </div>

            {/* MARQUEE CONTAINER */}
            <div
                className="flex w-full overflow-hidden relative z-10 mask-linear-gradient"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Gradient Masks for edges */}
                <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none"></div>

                <motion.div
                    className="flex space-x-6 pl-6"
                    animate={controls}
                >
                    {carouselItems.map((role, index) => (
                        <Link
                            key={`${role.slug}-${index}`}
                            to={`/explorar/${role.slug}`}
                            className="group relative w-64 h-80 flex-shrink-0 rounded-3xl overflow-hidden border border-transparent bg-zinc-900/50 backdrop-blur-sm cursor-pointer"
                        >
                            {/* Image Background */}
                            <img
                                src={role.img}
                                alt={role.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://placehold.co/400x600/18181b/3f3f46?text=${role.title.split(' ')[0]}`;
                                }}
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90"></div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                                    {role.title}
                                </h3>
                                <div className="h-0.5 w-12 bg-emerald-500 rounded-full group-hover:w-full transition-all duration-500 opacity-60 group-hover:opacity-100"></div>
                                <p className="text-xs text-zinc-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    Ver vacantes disponibles &rarr;
                                </p>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default JobCarousel;