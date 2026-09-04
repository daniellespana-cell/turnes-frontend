import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { PATHS } from '../../config/routes.paths';

import turnesLogo from "../../assets/logo-turnes.webp";

// --------------------- Nav Item ---------------------
const NavItem = ({ to, label, isMobile = false, onClick, isButton = false }) => {
  const baseClasses = `
    font-medium text-secondary text-sm px-3 py-2 hover:text-brand-success transition-colors relative group
    ${isMobile ? "block text-lg text-white" : "inline-block"}
  `;

  if (isButton) {
    return (
      <button
        onClick={onClick}
        style={{ fontFamily: 'inherit' }}
        className={`${baseClasses} text-left border-none bg-transparent cursor-pointer p-0 md:px-3 md:py-2 ${isMobile ? "w-full" : ""}`}
        type="button"
        aria-label="Acción">
        {label}
        {!isMobile && (
          <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-brand-success transition-all duration-300 transform -translate-x-1/2 group-hover:w-full"></span>
        )}
      </button>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={baseClasses}>
      {label}
      <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-brand-success transition-all duration-300 transform -translate-x-1/2 group-hover:w-full"></span>
    </Link>
  );
};

// --------------------- Buttons ---------------------
const AnimatedButton = ({ to, label, isMobile = false, isHeaderMobile = false, onClick, variant = 'primary' }) => {
  const isPrimary = variant === 'primary';
  const primaryStyles = "text-zinc-950 bg-emerald-400 hover:bg-emerald-300 border border-transparent shadow-[0_0_15px_rgba(52,211,153,0.3)]";
  const ghostStyles = "text-zinc-100 hover:text-white border border-zinc-700 hover:border-zinc-500 bg-zinc-900/80 hover:bg-zinc-800";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center
        ${isPrimary ? primaryStyles : ghostStyles}
        ${isMobile ? "w-full text-center px-4 py-2.5 mt-2" : ""}
        ${isHeaderMobile ? "px-4 py-2 text-sm ml-1 font-bold shadow-md" : ""}
        ${!isMobile && !isHeaderMobile ? "px-5 py-2" : ""}
      `}>
      <span className={`relative z-10 ${isPrimary ? 'text-zinc-950 font-extrabold' : 'text-zinc-100 font-medium'}`}>{label}</span>
    </Link>
  );
};

// --------------------- NAVBAR ---------------------
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isComoFunciona = pathname === '/como-funciona';
  const navbarClasses = `fixed top-0 left-0 w-full z-50 ${isComoFunciona ? 'bg-black/95 border-b border-zinc-900' : 'bg-[#0a0a0a]/90 border-b border-zinc-800'} backdrop-blur-md transition-all duration-300`;

  return (
    <>
      <nav 
        className={navbarClasses} 
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={turnesLogo}
                alt="Turnes Logo"
                width="120"
                height="32"
                className="h-7 md:h-8 w-auto object-contain logo-animated"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <NavItem to="/" label="Inicio" />
              <NavItem to={PATHS.PUBLIC.HOW_IT_WORKS} label="Para Empresas" />
              <NavItem to="/explorar" label="Características" />
              <NavItem to="/precios" label="Precios" />
              <NavItem to="/contacto" label="Contacto" />
            </div>

            {/* Buttons (Desktop & Mobile Visible) */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile: Compact Buttons */}
              <div className="flex md:hidden items-center mr-1 gap-1">
                <AnimatedButton to="/login" label="Ingresar" variant="ghost" isHeaderMobile={true} />
                <AnimatedButton to="/register" label="Regístrate Gratis" variant="primary" isHeaderMobile={true} />
              </div>

              {/* Desktop: Full Buttons (Hidden on Mobile to use custom layout above) */}
              <div className="hidden md:flex items-center space-x-3">
                <AnimatedButton to="/login" label="Ingresar" variant="ghost" />
                <AnimatedButton to="/register" label="Regístrate Gratis" variant="primary" />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                aria-label="Menú principal"
                aria-expanded={isOpen}
                className="md:hidden text-white p-1 rounded-md hover:text-brand-success focus:outline-none"
                type="button">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t border-zinc-800 overflow-hidden">
            <div className="flex flex-col space-y-1 px-4 py-6">
              <NavItem
                to="/"
                label="Inicio"
                isMobile={true}
                onClick={toggleMenu}
                role="button"
                tabIndex={0}
                onKeyDown={toggleMenu} />
              <NavItem
                to={PATHS.PUBLIC.HOW_IT_WORKS}
                label="Para Empresas"
                isMobile={true}
                onClick={toggleMenu}
                role="button"
                tabIndex={0}
                onKeyDown={toggleMenu} />
              <NavItem
                to="/explorar"
                label="Características"
                isMobile={true}
                onClick={toggleMenu}
                role="button"
                tabIndex={0}
                onKeyDown={toggleMenu} />
              <NavItem
                to="/precios"
                label="Precios"
                isMobile={true}
                onClick={toggleMenu}
                role="button"
                tabIndex={0}
                onKeyDown={toggleMenu} />
              <NavItem
                to="/contacto"
                label="Contacto"
                isMobile={true}
                onClick={toggleMenu}
                role="button"
                tabIndex={0}
                onKeyDown={toggleMenu} />
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;