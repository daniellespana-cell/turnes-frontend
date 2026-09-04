import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

const ValueProps = () => {
  return (
    <section className="py-24 md:py-32 bg-[#060d15] relative overflow-hidden border-t border-white/[0.06]" aria-labelledby="value-heading">
      {/* 🌊 Formas Fluidas Iridiscentes de Fondo (Estilo referencia con azules, cian y esmeralda) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Glow Superior Izquierdo: Cian / Azul */}
        <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-gradient-to-br from-cyan-500/20 via-blue-600/15 to-transparent rounded-full blur-[120px]" />
        
        {/* Glow Central / Derecho: Esmeralda / Menta */}
        <div className="absolute top-1/4 -right-24 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-400/20 via-teal-500/15 to-transparent rounded-full blur-[130px]" />
        
        {/* Glow Inferior: Azul Cobalto Profundo */}
        <div className="absolute -bottom-24 left-1/4 w-[650px] h-[450px] bg-gradient-to-t from-blue-700/20 via-indigo-600/15 to-transparent rounded-full blur-[140px]" />

        {/* 🎨 Elementos Gráficos Fluidos 3D Iridescentes */}
        <svg className="absolute top-12 -right-16 w-[450px] h-[450px] opacity-30 blur-[1px]" viewBox="0 0 200 200" fill="none">
          <path d="M50,90 C40,30 110,30 140,60 C170,90 160,160 100,160 C40,160 60,150 50,90 Z" stroke="url(#vpChroma1)" strokeWidth="6" strokeLinecap="round" />
          <defs>
            <linearGradient id="vpChroma1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute -bottom-10 -left-16 w-96 h-96 opacity-25 blur-[1px]" viewBox="0 0 200 200" fill="none">
          <path d="M150,110 C150,170 90,170 60,140 C30,110 40,40 100,40 C160,40 150,50 150,110 Z" stroke="url(#vpChroma2)" strokeWidth="7" strokeLinecap="round" />
          <defs>
            <linearGradient id="vpChroma2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="70%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* Header de Sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="value-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            El personal extra que necesitas, <br className="hidden sm:block" />
            justo cuando lo necesitas.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300/90 leading-relaxed font-normal">
            Conectamos la urgencia de tu negocio con personas verificadas listas para trabajar hoy.
          </p>
        </div>

        {/* Bloque Principal Asimétrico (Rompe el esquema de 4 cajas de IA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* LADO IZQUIERDO (7 cols): La Comparativa del Dolor Real vs Turnes (Cristal Translúcido) */}
          <div className="lg:col-span-7 bg-white/[0.05] border border-white/20 backdrop-blur-3xl rounded-[2.5rem] p-7 md:p-10 flex flex-col justify-between relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:border-white/35 transition-all duration-500">
            {/* Difusión Cromática Interna */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-400/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-600/25 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 block">
                La Realidad del Turno Extra
              </span>

              {/* Comparativa Visual */}
              <div className="space-y-4 mb-8">
                {/* Lo Tradicional */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-red-500/25 backdrop-blur-md flex items-start gap-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                  <div className="p-2 rounded-xl bg-red-500/15 text-red-400 shrink-0 mt-0.5 border border-red-500/20">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">El método tradicional te deja colgado</h3>
                    <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed">
                      El mesero o cocinero te cancela un viernes a las 5:00 PM. Preguntas en grupos de WhatsApp, no sabes si tienen antecedentes ni si van a llegar, y terminas atendiendo mesas tú mismo.
                    </p>
                  </div>
                </div>

                {/* Con Turnes */}
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-md flex items-start gap-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5 border border-emerald-400/20">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-300 mb-1">Con el Marketplace Turnes</h3>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                      Creas el turno en 2 minutos. Candidatos verificados con cédula, foto y calificaciones en Bucaramanga y el área metropolitana se postulan. Los validas y cubres tu turno en tiempo récord.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action contextual */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/register/empresa"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:scale-[1.02]"
                >
                  <span>Publicar un Turno Urgente</span>
                  <ArrowRight size={16} />
                </Link>
                <span className="text-xs text-zinc-300/80 font-medium text-center sm:text-left">
                  Tardas menos de 2 minutos • Sin cargos fijos
                </span>
              </div>
            </div>
          </div>

          {/* LADO DERECHO (5 cols): 3 Pilares Prácticos del Marketplace (Cristal Translúcido) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Pilar 1 */}
            <div className="p-6 rounded-[2rem] bg-white/[0.05] border border-white/15 backdrop-blur-3xl flex items-start gap-4 hover:border-white/30 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/15 text-amber-400 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Turnos Cubiertos en Horas</h3>
                <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed">
                  Accede a meseros, bartenders, baristas, ayudantes de cocina y personal de aseo listos para incorporarse el mismo día.
                </p>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-[2rem] bg-white/[0.05] border border-white/15 backdrop-blur-3xl flex items-start gap-4 hover:border-white/30 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/15 text-emerald-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <UserCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Identidad y Reputación Real</h3>
                <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed">
                  Cédula validada, verificación de antecedentes y calificaciones con estrellas dejadas por otros negocios reales tras cada turno.
                </p>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-[2rem] bg-white/[0.05] border border-white/15 backdrop-blur-3xl flex items-start gap-4 hover:border-white/30 transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/15 text-emerald-300 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">Pago Directo: 0% Comisión al Talento</h3>
                <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed">
                  Turnes jamás retiene salarios ni cobra comisión al colaborador. La empresa paga el 100% acordado directamente al trabajador al finalizar el turno (Efectivo, Nequi o DaviPlata).
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Barra de Métricas Reales del Marketplace (Cristal Translúcido) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 rounded-[2rem] bg-white/[0.05] border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <div className="text-center md:border-r border-white/10">
            <p className="text-2xl md:text-3xl font-black text-white tracking-tight">&lt; 2 Horas</p>
            <p className="text-xs text-zinc-300/80 mt-1 font-medium">Respuesta para turnos urgentes</p>
          </div>
          <div className="text-center md:border-r border-white/10">
            <p className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">100%</p>
            <p className="text-xs text-zinc-300/80 mt-1 font-medium">Identidad y cédula validada</p>
          </div>
          <div className="text-center md:border-r border-white/10">
            <p className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">0% Comisión</p>
            <p className="text-xs text-zinc-300/80 mt-1 font-medium">100% gratis para trabajadores</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-black text-white tracking-tight">Santander</p>
            <p className="text-xs text-zinc-300/80 mt-1 font-medium">Bga, Girón, Florida, Piedecuesta</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ValueProps;
