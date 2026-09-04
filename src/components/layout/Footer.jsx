import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import CookieSettingsModal from '../common/cookies/CookieSettingsModal';

import logoFromAssets from '../../assets/logo-turnes.webp';

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
  const { pathname } = useLocation();
  const isComoFunciona = pathname === '/como-funciona';

  return (
    <footer className={`${isComoFunciona ? 'bg-black border-t border-zinc-900' : 'bg-[#09090b] border-t border-zinc-800/80'} text-white pt-16 pb-8 relative overflow-hidden`}>
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* GRID PRINCIPAL DE MARKETPLACE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-zinc-800/60">
          
          {/* 1. Marca + Propuesta de Valor del Marketplace */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-8">
            <Link to="/" className="inline-block mb-5">
              <img
                src={logoFromAssets}
                alt="Turnes Marketplace Logo"
                width="130"
                height="36"
                className="h-9 w-auto object-contain select-none hover:opacity-90 transition-opacity"
              />
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-sm">
              El <strong className="text-zinc-200 font-semibold">marketplace de turnos bajo demanda</strong> en Colombia. Conectamos restaurantes, bares, comercios y eventos con meseros, baristas, cocineros y colaboradores verificados en tiempo récord.
            </p>

            {/* Badges de Confianza */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Turnos en Vivo
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-medium">
                🛡️ Identidad Verificada
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-[11px] font-bold">
                ✨ 0% Comisión a Trabajadores
              </span>
            </div>

            {/* Redes Sociales */}
            <div className="flex items-center gap-2.5">
              <a href="https://www.instagram.com/turnes.co/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-800 transition-all group">
                <Instagram size={17} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://facebook.com/Turnes.co" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-800 transition-all group">
                <Facebook size={17} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" aria-label="LinkedIn" className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-800 transition-all group">
                <Linkedin size={17} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="mailto:soporte@turnes.co" aria-label="Correo de soporte" className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-800 transition-all group">
                <Mail size={17} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* 2. Para Negocios / Empleadores */}
          <div>
            <h3 className="text-xs font-black mb-5 text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              Para Negocios
            </h3>
            <ul className="space-y-2.5 list-none p-0">
              <FooterLink to="/publicar" label="Publicar Turno Urgente" isHighlight />
              <FooterLink to="/como-funciona" label="Cómo Funciona" />
              <FooterLink to="/precios" label="Planes y Tarifas" />
              <FooterLink to="/politica-pagos" label="Modelo de Conexión" />
              <FooterLink to="/contacto" label="Atención para Empresas" />
            </ul>
          </div>

          {/* 3. Para Talento / Trabajadores */}
          <div>
            <h3 className="text-xs font-black mb-5 text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Para Talento
            </h3>
            <ul className="space-y-2.5 list-none p-0">
              <FooterLink to="/register/talento" label="Registrarte Gratis (0% Comisión)" isHighlight />
              <FooterLink to="/politica-pagos" label="Pago Directo: Día Trabajado, Pagado" />
              <FooterLink to="/politicas" label="Reglas de Confiabilidad" />
              <FooterLink to="/login" label="Ingresar a mi Perfil" />
            </ul>
          </div>

          {/* 4. Cobertura y Legal */}
          <div>
            <h3 className="text-xs font-black mb-5 text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Legal & Tarifas
            </h3>
            <ul className="space-y-2.5 list-none p-0">
              <FooterLink to="/politica-pagos" label="Política de Pagos y Tarifas" />
              <FooterLink to="/terminos" label="Términos del Servicio" />
              <FooterLink to="/privacidad" label="Política de Privacidad" />
              <FooterLink to="/politicas" label="Código de Conducta" />
              <li>
                <button
                  onClick={() => setIsCookieModalOpen(true)}
                  className="inline-block py-1 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  type="button"
                  aria-label="Configurar preferencias de cookies">
                  Preferencias de Cookies
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR: ZONAS + COPYRIGHT */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-zinc-500 text-xs font-medium">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-zinc-400">
            <span className="text-zinc-500 font-semibold">Zonas operativas activas:</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">Bucaramanga</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">Floridablanca</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">Girón</span>
            <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">Piedecuesta</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <p>&copy; {currentYear} Turnes. Todos los derechos reservados.</p>
            <span className="text-zinc-400 font-semibold">Hecho con orgullo en Santander, Colombia 🇨🇴</span>
          </div>
        </div>
      </div>
      <CookieSettingsModal isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
    </footer>
  );
};

const FooterLink = ({ to, label, isHighlight = false }) => (
  <li>
    <Link
      to={to}
      className={`inline-block py-1 text-sm transition-all duration-200 ${
        isHighlight 
          ? 'text-emerald-400 font-semibold hover:text-emerald-300 hover:translate-x-1' 
          : 'text-zinc-400 hover:text-zinc-200 hover:translate-x-1'
      }`}
    >
      {label}
    </Link>
  </li>
);

export default LandingFooter;
