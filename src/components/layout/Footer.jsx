import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';


import logoFromAssets from '../../assets/logo-turnes.png';

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const FooterLink = ({ to, label }) => (
    <li>
      <Link
        to={to}
        className="text-secondary hover:text-brand-success transition-colors text-base"
      >
        {label}
      </Link>
    </li>
  );

  return (
    <footer className="bg-app/90 backdrop-blur-sm shadow-lg border-t border-zinc-800 text-main pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-6">

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">

          {/* 1. Logo + Info */}
          <div className="flex flex-col items-start min-w-[200px]">
            <img
              src={logoFromAssets}
              alt="Turnes Logo"
              className="h-10 w-auto object-contain select-none logo-animated mb-3"
            />

            <p className="text-secondary mb-4 text-base">
              La plataforma moderna para gestionar turnos y citas de manera eficiente.
            </p>

            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-secondary hover:text-brand-success transition text-xl">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-secondary hover:text-brand-success transition text-xl">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="text-secondary hover:text-brand-success transition text-xl">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-secondary hover:text-brand-success transition text-xl">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* 2. Enlaces rápidos */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-white">Enlaces Rápidos</h4>
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
            <h4 className="text-xl font-semibold mb-4 text-white">Legal & Docs</h4>
            <ul className="space-y-2 list-none p-0">
              <FooterLink to="/privacidad" label="Política de Privacidad" />
              <FooterLink to="/terminos" label="Términos y Condiciones" />
              <FooterLink to="/politicas" label="Políticas de Usuario" />
              <FooterLink to="/politica-pagos" label="Política de Pagos" />
            </ul>
          </div>

          {/* 4. Soporte */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-white">Soporte</h4>
            <ul className="space-y-3 text-base list-none p-0">
              <li className="flex items-center text-secondary">
                <Mail size={18} className="text-brand-success mr-3" />
                soporte@turnes.com
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-zinc-800 mt-6 pt-6 text-center text-secondary text-base">
          <p>&copy; {currentYear} Turnes. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
