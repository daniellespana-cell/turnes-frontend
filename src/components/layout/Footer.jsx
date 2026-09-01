import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import CookieSettingsModal from '../common/cookies/CookieSettingsModal';


import logoFromAssets from '../../assets/logo-turnes.webp';

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  return (
    <footer className="bg-[#09090b] border-t border-zinc-800/50 text-white pt-12 pb-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 py-8">
          
          {/* 1. Logo + Info */}
          <div className="flex flex-col items-start sm:col-span-2 md:col-span-1">
            <img
              src={logoFromAssets}
              alt="Turnes Logo"
              width="140"
              height="40"
              className="h-10 w-auto object-contain select-none mb-6 hover:scale-105 transition-transform duration-300"
            />

            <p className="text-zinc-400 mb-8 text-sm leading-relaxed max-w-sm sm:max-w-md md:max-w-xs">
              La plataforma moderna para gestionar turnos y citas de manera eficiente y automatizada.
            </p>

            <div className="flex items-center gap-3">
              <a href="https://facebook.com/Turnes.co" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300 group">
                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" aria-label="Twitter" className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300 group">
                <Twitter size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.instagram.com/turnes.co/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300 group">
                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" aria-label="LinkedIn" className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300 group">
                <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* 2. Enlaces rápidos */}
          <div>
            <h4 className="text-xs font-black mb-6 text-white uppercase tracking-widest">Enlaces Rápidos</h4>
            <ul className="space-y-2 list-none p-0">
              <FooterLink to="/" label="Inicio" />
              <FooterLink to="/explorar" label="Explorar Vacantes" />
              <FooterLink to="/precios" label="Planes y Precios" />
              <FooterLink to="/about" label="Misión Turnes" />
              <FooterLink to="/contacto" label="Contacto" />
            </ul>
          </div>

          {/* 3. Legal */}
          <div>
            <h4 className="text-xs font-black mb-6 text-white uppercase tracking-widest">Legal & Docs</h4>
            <ul className="space-y-2 list-none p-0">
              <FooterLink to="/privacidad" label="Política de Privacidad" />
              <FooterLink to="/terminos" label="Términos y Condiciones" />
              <FooterLink to="/politicas" label="Políticas de Usuario" />
              <FooterLink to="/politica-pagos" label="Política de Pagos" />
              <li>
                <button
                  onClick={() => setIsCookieModalOpen(true)}
                  className="inline-block py-1.5 text-sm text-zinc-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-300"
                  type="button"
                  aria-label="Acción">
                  Preferencias de Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* 4. Soporte */}
          <div>
            <h4 className="text-xs font-black mb-6 text-white uppercase tracking-widest">Soporte</h4>
            <ul className="space-y-4 list-none p-0">
              <li>
                <a href="mailto:soporte@turnes.com" className="group flex items-center text-sm text-zinc-400 hover:text-emerald-400 transition-colors duration-300">
                  <div className="p-2.5 rounded-xl bg-zinc-800/50 group-hover:bg-emerald-500/20 mr-3.5 transition-colors border border-zinc-700/50 group-hover:border-emerald-500/30">
                    <Mail size={16} className="text-emerald-500" />
                  </div>
                  soporte@turnes.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-zinc-800/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-zinc-400 text-xs font-medium">
          <p>&copy; {currentYear} Turnes. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Hecho con ❤️ en Colombia</span>
          </div>
        </div>
      </div>
      <CookieSettingsModal isOpen={isCookieModalOpen} onClose={() => setIsCookieModalOpen(false)} />
    </footer>
  );
};

const FooterLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="inline-block py-1.5 text-sm text-zinc-400 hover:text-emerald-400 hover:translate-x-1 transition-all duration-300"
    >
      {label}
    </Link>
  </li>
);

export default LandingFooter;
