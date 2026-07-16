import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Briefcase } from 'lucide-react';

import { Zap, Star, ShieldCheck, Clock } from 'lucide-react';

const Beneficios = () => {
  return (
    <section id="beneficios" className="pt-24 pb-8 bg-zinc-950 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            El Ecosistema <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Turnes</span>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Diseñado meticulosamente para conectar necesidad con talento, sin intermediarios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">

          {/* CARD 1: EMPRESAS (Indigo) */}
          <div className="relative group rounded-[2.5rem] p-8 md:p-12 border border-transparent bg-gradient-to-br from-indigo-900/10 to-zinc-900/40 backdrop-blur-md overflow-hidden  transition-all duration-500">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">Para Empresas</h3>
              <p className="text-indigo-200/60 mb-8 font-medium">Automatiza tu contratación.</p>

              <ul className="space-y-6 mb-12">
                {[
                  { text: "Candidatos Verificados (ID + Antecedentes)", icon: ShieldCheck },
                  { text: "Contratación en < 2 horas", icon: Zap },
                  { text: "Dashboard de Gestión Total", icon: Star }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="text-zinc-300 text-sm md:text-base font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register?type=empresa" className="inline-flex w-full items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm tracking-wide transition-all shadow-md shadow-indigo-500/20 group-hover:scale-[1.01]">
                EMPIEZA A CONTRATAR
              </Link>
            </div>
          </div>

          {/* CARD 2: TRABAJADORES (Emerald) */}
          <div className="relative group rounded-[2.5rem] p-8 md:p-12 border border-transparent bg-gradient-to-br from-emerald-900/10 to-zinc-900/40 backdrop-blur-md overflow-hidden  transition-all duration-500">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-500"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-8 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">Para Talentos</h3>
              <p className="text-emerald-200/60 mb-8 font-medium">Gana dinero con tu libertad.</p>

              <ul className="space-y-6 mb-12">
                {[
                  { text: "Pagos Garantizados", icon: ShieldCheck },
                  { text: "Construye tu Reputación Digital", icon: Star },
                  { text: "Horarios 100% Flexibles", icon: Clock }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300 text-sm md:text-base font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register?type=jobseeker" className="inline-flex w-full items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm tracking-wide transition-all shadow-md shadow-emerald-500/20 group-hover:scale-[1.01]">
                ENCUENTRA TURNOS
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Beneficios;
