import React from 'react';
import { m as motion } from 'framer-motion';

import { Zap, ShieldCheck, Globe, Trophy } from 'lucide-react';

const valueProps = [
  {
    icon: Zap,
    title: "Velocidad Supersónica",
    desc: "De la necesidad a la contratación en menos de 2 horas. Algoritmos de matching en tiempo real.",
    gradient: "from-amber-400 to-orange-500",
    iconColor: "text-amber-400"
  },
  {
    icon: ShieldCheck,
    title: "Verificación Total",
    desc: "Identidad, antecedentes y referencias validadas automáticamente con IA.",
    gradient: "from-emerald-400 to-teal-500",
    iconColor: "text-emerald-400"
  },
  {
    icon: Globe,
    title: "Cobertura Nacional",
    desc: "Accede a una red de talento distribuido lista para trabajar en cualquier ubicación.",
    gradient: "from-blue-400 to-indigo-500",
    iconColor: "text-blue-400"
  },
  {
    icon: Trophy,
    title: "Calidad Garantizada",
    desc: "Sistema de reputación transparente. Solo el mejor talento llega a tu equipo.",
    gradient: "from-purple-400 to-pink-500",
    iconColor: "text-purple-400"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const ValueProps = () => {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden" aria-labelledby="value-heading">

      {/* Ambient Light for Section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {valueProps.map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative p-8 rounded-3xl border border-transparent bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-300"
            >
              {/* Internal Glow on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-zinc-900 border border-transparent flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {card.title}
                </h3>

                <p className="text-sm text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProps;
