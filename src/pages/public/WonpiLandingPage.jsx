import React from 'react';

import { useState } from 'react';

// Simple Icons
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12"></line><line x1="4" x2="20" y1="6"></line><line x1="4" x2="20" y1="18"></line></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const WonpiLandingPage = () => {
    const [showTerms, setShowTerms] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black">T</div>
                        <span className="text-xl font-bold tracking-tight">turnes</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                        <a href="#features" className="hover:text-white transition-colors">Características</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Planes</a>
                        <a href="#contact" className="hover:text-white transition-colors">Contacto</a>
                        <button
                            className="px-5 py-2 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all"
                            type="button"
                            aria-label="Acción">
                            Próximamente
                        </button>
                    </div>
                    <button className="md:hidden text-zinc-400" type="button" aria-label="Acción">
                        <MenuIcon />
                    </button>
                </div>
            </nav>
            {/* --- HERO --- */}
            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Lanzamiento 2026
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                    El Futuro del Trabajo <br /> en Hostelería
                </h1>

                <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed mb-12">
                    Conectamos a los mejores profesionales del sector HORECA con establecimientos premium. Sin intermediarios, sin fricción.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <input
                        type="email"
                        placeholder="Tu correo electrónico"
                        className="flex-1 bg-white/5 border border-transparent rounded-xl px-5 py-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-600"
                    />
                    <button
                        className="bg-emerald-500 text-black font-bold text-lg px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_-5px_#10b98150]"
                        type="button"
                        aria-label="Acción">
                        Notificarme
                    </button>
                </div>
            </section>
            {/* --- FEATURE GRID --- */}
            <section id="features" className="py-20 px-6 border-t border-white/5 bg-zinc-900/20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Verificación Instantánea", desc: "Validamos identidad y antecedentes seguridad en tiempo real." },
                        { title: "Pagos Automáticos", desc: "Los turnos se pagan al finalizar, directamente a tu billetera." },
                        { title: "Calificación 360°", desc: "Sistema de reputación transparente para empresas y staff." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-[#0f0f10] border border-transparent  transition-colors">
                            <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                            <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
            {/* --- PRICING (REQUIRED FOR WOMPI) --- */}
            <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Planes Transparentes</h2>
                    <p className="text-zinc-400">Tarifas simples para establecimientos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Plan Freemium */}
                    <div className="p-8 rounded-3xl border border-transparent bg-white/5">
                        <h3 className="text-xl font-bold text-zinc-400 mb-2">Starter</h3>
                        <div className="text-4xl font-bold mb-6">$0</div>
                        <ul className="space-y-4 mb-8 text-zinc-300">
                            <li className="flex gap-3"><CheckIcon /> Publicar vacantes</li>
                            <li className="flex gap-3"><CheckIcon /> Chat básico</li>
                            <li className="flex gap-3"><CheckIcon /> Comisión por turno: 15%</li>
                        </ul>
                    </div>

                    {/* Plan Pro */}
                    <div className="relative p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                        <h3 className="text-xl font-bold text-emerald-400 mb-2">Pro Business</h3>
                        <div className="text-4xl font-bold mb-6">$50.000 <span className="text-lg font-normal text-zinc-500">/mes</span></div>
                        <ul className="space-y-4 mb-8 text-zinc-300">
                            <li className="flex gap-3"><CheckIcon /> Postulantes Ilimitados</li>
                            <li className="flex gap-3"><CheckIcon /> Comisión reducida: 6%</li>
                            <li className="flex gap-3"><CheckIcon /> Soporte Prioritario</li>
                        </ul>
                        <button
                            className="w-full py-3 rounded-xl bg-white text-black font-bold opacity-50 cursor-not-allowed"
                            type="button"
                            aria-label="Acción">
                            Lista de Espera
                        </button>
                    </div>
                </div>
            </section>
            {/* --- FOOTER & LEGAL --- */}
            <footer className="py-12 px-6 border-t border-white/5 text-center text-zinc-500 text-sm">
                <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
                    <div>© 2026 Turnes App S.A.S. Todos los derechos reservados.</div>
                    <div className="flex gap-6">
                        <button
                            onClick={() => setShowTerms(true)}
                            className="hover:text-white transition-colors"
                            type="button"
                            aria-label="Acción">Términos y Condiciones</button>
                        <button
                            onClick={() => setShowTerms(true)}
                            className="hover:text-white transition-colors"
                            type="button"
                            aria-label="Acción">Política de Privacidad</button>
                        <a href="mailto:legal@turnes.co" className="hover:text-white transition-colors">legal@turnes.co</a>
                    </div>
                </div>
                <div className="mt-8 opacity-50 text-xs">
                    Pagos procesados de forma segura por Wompi.
                </div>
            </footer>
            {/* --- TERMS MODAL --- */}
            {showTerms && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#111] border border-transparent rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 text-white relative">
                        <button
                            onClick={() => setShowTerms(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                            type="button"
                            aria-label="Acción">✕</button>
                        <h2 className="text-2xl font-bold mb-6">Términos y Condiciones</h2>
                        <div className="space-y-4 text-zinc-400 leading-relaxed">
                            <p>Ultima actualización: Febrero 2026</p>
                            <p>Bienvenido a Turnes. Al usar nuestra plataforma, aceptas conectar directamente con personal calificado bajo las leyes laborales vigentes en Colombia.</p>
                            <h3 className="text-white font-bold mt-4">1. Pagos y Reembolsos</h3>
                            <p>Turnes utiliza Wompi como pasarela de pagos. Todas las recargas son finales. Los reembolsos se procesan únicamente en caso de fallos técnicos verificables.</p>
                            <h3 className="text-white font-bold mt-4">2. Responsabilidad</h3>
                            <p>Turnes actúa como intermediario tecnológico. La relación laboral es exclusiva entre el Establecimiento y el Talento.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WonpiLandingPage;
