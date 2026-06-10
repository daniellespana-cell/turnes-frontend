
const BrandingSidebar = () => {
    return (
        <div className="hidden lg:flex lg:col-span-5 relative p-12 text-white flex-col justify-between overflow-hidden bg-indigo-600">

            {/* STATIC HIGH-PERFORMANCE BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800"></div>

            {/* Subtle Texture (No Animation Cost) */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-noise"></div>

            {/* Decorative Geometry (Static) */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-8 backdrop-blur-md border border-white/20 shadow-lg">
                    <Rocket className="w-8 h-8 text-white" />
                </div>

                {/* TYPOGRAPHY: EXTREME IMPACT (Nike/Apple Style) */}
                <div className="flex flex-col gap-2">
                    <span className="text-indigo-300 font-bold tracking-[0.2em] uppercase text-sm animate-fade-in">
                        La Nueva Era
                    </span>

                    <h2 className="text-6xl xl:text-8xl font-black text-white leading-[0.85] tracking-tighter drop-">
                        DE LA REVOLU<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                            CIÓN
                        </span><br />
                        LABORAL
                    </h2>

                    <div className="h-2 w-24 bg-emerald-500 my-6 rounded-full"></div>

                    <p className="text-2xl text-white font-medium max-w-sm leading-snug">
                        <span className="text-indigo-300">Olvídate</span> de la burocracia.
                        <br />
                        <span className="font-bold text-white">Contrata o trabaja hoy.</span>
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-12 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-400 border-2 border-indigo-600"></div>
                        <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-indigo-600"></div>
                        <div className="w-8 h-8 rounded-full bg-emerald-400 border-2 border-indigo-600"></div>
                    </div>
                    <div className="text-sm font-semibold text-white/90">
                        +2,000 Profesionales unidos hoy
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingSidebar;
