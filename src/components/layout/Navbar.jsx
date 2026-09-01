import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import HowItWorksModal from '../landing/HowItWorksModal';

import { useState } from "react";

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
      className={baseClasses}
      role="button"
      tabIndex={0}
      onKeyDown={onClick}>
      {label}
      <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-brand-success transition-all duration-300 transform -translate-x-1/2 group-hover:w-full"></span>
    </Link>
  );
};

// --------------------- Buttons ---------------------
const AnimatedButton = ({ to, label, isMobile = false, isHeaderMobile = false, onClick, variant = 'primary' }) => {
  const primaryStyles = "text-zinc-950 bg-emerald-400 hover:bg-emerald-300 border border-transparent shadow-[0_0_15px_rgba(52,211,153,0.3)] font-bold";
  const ghostStyles = "text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-800";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden transition-all duration-300 flex items-center justify-center
        ${variant === 'primary' ? primaryStyles : ghostStyles}
        ${isMobile ? "w-full text-center px-4 py-2.5 mt-2" : ""}
        ${isHeaderMobile ? "px-4 py-2 text-sm ml-1 font-bold shadow-md" : ""}
        ${!isMobile && !isHeaderMobile ? "px-5 py-2" : ""}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={onClick}>
      <span className="relative z-10">{label}</span>
    </Link>
  );
};

// --------------------- NAVBAR ---------------------
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false); // State for Modal

  const toggleMenu = () => setIsOpen(!isOpen);

  const navbarClasses =
    "fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-zinc-800 transition-all duration-300";

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
              <NavItem
                to="#"
                label="Cómo funciona"
                isButton={true}
                // Open Modal
                onClick={() => setIsHowItWorksOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={() => setIsHowItWorksOpen(true)} />
              <NavItem to="/explorar" label="Características" />
              <NavItem to="/precios" label="Precios" />
              <NavItem to="/contacto" label="Contacto" />
            </div>

            {/* Buttons (Desktop & Mobile Visible) */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile: Compact Buttons */}
              <div className="flex md:hidden items-center mr-1 gap-1">
                <AnimatedButton to="/login" label="Ingresar" variant="ghost" isHeaderMobile={true} />
                <AnimatedButton to="/register" label="Regístrate" variant="primary" isHeaderMobile={true} />
              </div>

              {/* Desktop: Full Buttons (Hidden on Mobile to use custom layout above) */}
              <div className="hidden md:flex items-center space-x-3">
                <AnimatedButton to="/login" label="Ingresar" variant="ghost" />
                <AnimatedButton to="/register" label="Regístrate" variant="primary" />
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
                to="#"
                label="Cómo funciona"
                isMobile={true}
                isButton={true}
                onClick={() => { setIsHowItWorksOpen(true); toggleMenu(); }}
                role="button"
                tabIndex={0}
                onKeyDown={() => { setIsHowItWorksOpen(true); toggleMenu(); }} />
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
      {/* MODAL "CÓMO FUNCIONA" */}
      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </>
  );
};

export default Navbar;