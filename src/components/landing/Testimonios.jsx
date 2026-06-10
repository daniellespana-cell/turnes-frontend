import React from 'react';
import { Quote } from 'lucide-react';


const testimonios = [
  {
    quote: "Turnes me salvó en una noche pico. Encontré meseros en minutos.",
    author: "Carlos M.",
    role: "Restaurante El Buen Sabor",
    initials: "CM"
  },
  {
    quote: "Como barista, gano extra sin compromisos. ¡Pagos inmediatos!",
    author: "Ana López",
    role: "Barista Freelance",
    initials: "AL"
  },
  {
    quote: "El Plan Micro nos dio acceso prioritario a candidatos verificados.",
    author: "Sofía R.",
    role: "Café Central",
    initials: "SR"
  }
];

const StarRating = () => (
  <div className="flex gap-1 mb-4">
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} className="w-4 h-4 text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
);

const Testimonios = () => {
  return (
    <section id="testimonios" className="pt-8 pb-24 bg-zinc-950 relative">
      <div className="container mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Voces de la <span className="text-emerald-400">Comunidad</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.map((t, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-zinc-900/50 border border-transparent hover:bg-zinc-800/50 transition-colors relative">
              <Quote className="absolute top-8 right-8 text-white/5 w-12 h-12 rotate-180" />

              <StarRating />

              <p className="text-lg text-zinc-300 mb-8 font-medium leading-relaxed relative z-10">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t.author}</h4>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonios;
