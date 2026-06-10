
// --- IMPORTACIONES REALES DE LAYOUT (Sin Mocks) ---


const AcercaDe = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <SEO 
        title="Misión y Visión | Acerca de Turnes" 
        description="Conoce la misión y visión de Turnes. Estamos dignificando el talento operativo en Latinoamérica a través de la tecnología, conectando profesionales con empresas de hospitalidad y construcción." 
      />
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

          {/* --- MISIÓN Y VISIÓN (Humanizadas) --- */}
          <div className="py-16 bg-zinc-900/30 border-y border-white/5 backdrop-blur-sm mb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Misión */}
                <div className="relative p-8 rounded-2xl bg-zinc-950 border border-emerald-500/10 shadow-lg group hover:border-emerald-500/30 transition-colors">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="bg-emerald-500/10 w-12 h-12 rounded-lg border border-emerald-500/20 flex items-center justify-center mb-6">
                    <Heart className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Nuestra Misión
                  </h3>
                  <p className="text-base text-zinc-400 leading-relaxed">
                    Creemos que el talento humano es el verdadero motor de Latinoamérica. Nuestra misión es dignificar el trabajo operativo conectando a personas brillantes de la construcción y hospitalidad con empresas que valoran la excelencia. Construimos tecnología humana, segura y rápida para que cada turno sea una oportunidad de crecimiento, sin burocracia ni barreras.
                  </p>
                </div>

                {/* Visión */}
                <div className="relative p-8 rounded-2xl bg-zinc-950 border border-emerald-500/10 shadow-lg group hover:border-emerald-500/30 transition-colors">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="bg-emerald-500/10 w-12 h-12 rounded-lg border border-emerald-500/20 flex items-center justify-center mb-6">
                    <Eye className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Nuestra Visión
                  </h3>
                  <p className="text-base text-zinc-400 leading-relaxed">
                    Ser el estándar de confianza y progreso para la fuerza laboral de nuestra región. Soñamos con un ecosistema donde el esfuerzo y la reputación de cada trabajador hablen por sí mismos, empoderando a millones a construir carreras sólidas y a las empresas a prosperar con el equipo ideal, creando un impacto económico real y positivo.
                  </p>
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
              <div className="bg-zinc-900/40 p-8 rounded-2xl border border-transparent  transition-colors duration-300 group">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-300 text-zinc-400">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Simplicidad Radical</h3>
                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                  Si requiere entrenamiento para usarse, no pertenece a Turnes. Diseñamos para la intuición.
                </p>
              </div>

              {/* Valor 2 */}
              <div className="bg-zinc-900/40 p-8 rounded-2xl border border-transparent  transition-colors duration-300 group">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-300 text-zinc-400">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Privacidad Total</h3>
                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                  Encriptación de nivel bancario en cada operación para proteger tu negocio y tus clientes.
                </p>
              </div>

              {/* Valor 3 */}
              <div className="bg-zinc-900/40 p-8 rounded-2xl border border-transparent  transition-colors duration-300 group">
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