import React from 'react';
import { Users, Target, Shield, Clock, CheckCircle } from 'lucide-react';

// --- IMPORTACIONES REALES DE LAYOUT (Sin Mocks) ---
import CtaSection from '../components/common/CtaSection.jsx';

const AcercaDe = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navbar handled by MainLayout */}

      <main className="flex-grow pt-24 md:pt-32 pb-20 relative overflow-hidden">
        {/* Static Background Decor */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* --- HERO HEADER --- */}
          <header className="text-center mb-24">
            <h2 className="text-xs font-bold text-emerald-500 tracking-widest uppercase mb-4">
              Nuestra Esencia
            </h2>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
              Revolucionando la <br />
              <span className="text-emerald-400">
                Gestión del Tiempo
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed font-light">
              En Turnes, no solo organizamos agendas. Creamos tecnología diseñada para la velocidad,
              la seguridad y para que el talento local se quede y crezca aquí.
            </p>
          </header>

          {/* --- MISIÓN (Grid Layout) --- */}
          <div className="py-16 bg-zinc-900/30 border-y border-white/5 backdrop-blur-sm mb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">

                {/* Texto Misión */}
                <div className="order-2 lg:order-1 mt-10 lg:mt-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Nuestra Misión: <span className="text-emerald-400">Simple y Potente</span>
                  </h3>

                  <p className="text-base text-zinc-400 mb-8 leading-relaxed">
                    Turnes nació para solucionar un problema real: sistemas demasiado brillantes, lentos y complejos.
                    Construimos una plataforma que entiende el ritmo de los negocios modernos en Latinoamérica.
                  </p>

                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-zinc-300 text-sm">Interfaz diseñada para el Modo Oscuro nativo.</span>
                    </li>

                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-zinc-300 text-sm">Gestión de citas en menos de 3 clics.</span>
                    </li>

                    <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-zinc-300 text-sm">Reducción comprobada de la fatiga visual.</span>
                    </li>
                  </ul>
                </div>

                {/* Visual */}
                <div className="order-1 lg:order-2 relative p-8 rounded-2xl bg-white/5 border border-white/5 shadow-2xl backdrop-blur-sm">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>

                  <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                    <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                      <Clock className="h-8 w-8 text-emerald-400" />
                    </div>

                    <div>
                      <div className="text-white font-bold text-lg">Eficiencia Turnes</div>
                      <div className="text-emerald-400 text-sm font-medium">Ahorro promedio: 15h/mes</div>
                    </div>
                  </div>

                  <div className="space-y-3 opacity-30">
                    <div className="h-2 w-full bg-white/20 rounded-full"></div>
                    <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* --- Grid Valores --- */}
          <div className="pb-20">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-white mb-3">Nuestros Pilares</h3>
              <p className="text-zinc-500">La base sobre la que construimos cada línea de código.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

              {/* Valor 1 */}
              <div className="bg-zinc-900/40 p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors duration-300 group">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-300 text-zinc-400">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Simplicidad Radical</h3>
                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                  Si requiere entrenamiento para usarse, no pertenece a Turnes. Diseñamos para la intuición.
                </p>
              </div>

              {/* Valor 2 */}
              <div className="bg-zinc-900/40 p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors duration-300 group">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-300 text-zinc-400">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Privacidad Total</h3>
                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                  Encriptación de nivel bancario en cada operación para proteger tu negocio y tus clientes.
                </p>
              </div>

              {/* Valor 3 */}
              <div className="bg-zinc-900/40 p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors duration-300 group">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-300 text-zinc-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Soporte Humano</h3>
                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                  No bots genéricos. Personas reales ayudando a empresas reales a crecer en Latinoamérica.
                </p>
              </div>
            </div>
          </div>

          {/* --- CTA FINAL --- */}
          <CtaSection />

        </div>
      </main>

      {/* Footer handled by MainLayout */}
    </div>
  );
};

export default AcercaDe;