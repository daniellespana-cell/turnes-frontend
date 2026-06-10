// Imported

// 🟢 Importamos la imagen desde la ruta relativa correcta (WebP Optimizado)
import heroBackgroundImage from '../../assets/mi-foto-hero.webp';

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: "easeOut" } }
};

const wordContainer = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const wordAnimation = {
  hidden: { opacity: 0, y: 30, rotateX: -10 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const pulseAnimation = {
  scale: [1, 1.02, 1],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
    delay: 1.5
  }
};

const Hero = () => {

  const heroText = "Empleos por turnos y fijos, al instante.";
  const words = heroText.split(" ");

  return (
    <motion.section
      className="py-32 md:py-48 bg-zinc-950 text-main overflow-hidden relative"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      role="banner"
      aria-labelledby="hero-heading"
    >

      {/* 1. IMAGEN DE FONDO (ALTA NITIDEZ) - LCP OPTIMIZED */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src={heroBackgroundImage}
          alt="Fondo Hero"
          className="w-full h-full object-cover object-center"
          fetchPriority="high" // ⚡ Senior Dev Move: Prioritize LCP
          loading="eager"
        />
        {/* Capa de Oscurecimiento: Fondo negro (70%) para asegurar el contraste de lectura. */}
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">

          {/* Badge "Nueva Era" (Micro-Interaction) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-transparent bg-white/5 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-default"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-zinc-300 tracking-widest uppercase text-[10px]">La nueva era del trabajo</span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-white mb-8 drop-shadow-2xl"
            variants={wordContainer}
            initial="hidden"
            animate="visible"
          >
            EL FUTURO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              ES AHORA
            </span>
          </motion.h1>

          <p className="text-xl md:text-2xl text-zinc-300 my-10 max-w-3xl mx-auto leading-relaxed font-light">
            Conectamos talento verificado con empresas líderes en tiempo récord.<br className="hidden md:block" /> Sin fricción. Sin esperas.
          </p>


          {/* 3. HERO SEARCH (Platzi-Style) */}
          <HeroSearch />

          {/* 4. SOCIAL PROOF (Trust Badge) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4"
          >
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Confiado por +50 empresas en la ciudad
            </p>
            <div className="flex -space-x-3 opacity-80 hover:opacity-100 transition-opacity">
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=H&background=0D8ABC&color=fff" alt="Company 1" />
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=R&background=FFB347&color=fff" alt="Company 2" />
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=C&background=FF69B4&color=fff" alt="Company 3" />
              <img className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" src="https://ui-avatars.com/api/?name=T&background=10b981&color=fff" alt="Company 4" />
              <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">
                +46
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.section >
  );
};

export default Hero;