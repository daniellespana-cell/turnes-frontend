import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ ÚNICA CORRECCIÓN: Ruta ajustada para subir dos niveles
import turnesLogo from "../../assets/logo-turnes.png";
import HowItWorksModal from "../landing/HowItWorksModal";

// --------------------- Nav Item ---------------------
const NavItem = ({ to, label, isMobile = false, onClick, isButton = false }) => {
  if (isButton) {
    return (
      <button
        onClick={onClick}
        className={`
            font-medium text-secondary text-sm px-3 py-2 hover:text-brand-success transition-colors relative group text-left
            ${isMobile ? "block text-lg text-white w-full" : "inline-block"}
          `}
      >
        {label}
        {!isMobile && (
          <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-brand-success transition-all duration-300 transform -translate-x-1/2 group-hover:w-full"></span>
        )}
      </button>
    )
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        font-medium text-secondary text-sm px-3 py-2 hover:text-brand-success transition-colors relative group
        ${isMobile ? "block text-lg text-white" : "inline-block"}
      `}
    >
      {label}
      <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-brand-success transition-all duration-300 transform -translate-x-1/2 group-hover:w-full"></span>
    </Link>
  );
};

// --------------------- Buttons ---------------------
const AnimatedButton = ({ to, label, isMobile = false, isHeaderMobile = false, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`
      btn relative rounded-lg font-semibold overflow-hidden group transition-all duration-300
      text-white border border-brand-success hover:border-white/70 bg-brand-primary hover:bg-brand-primary/90 shadow-md shadow-brand-primary/30
      ${isMobile ? "w-full text-center px-4 py-2 ml-2" : ""}
      ${isHeaderMobile ? "px-3 py-1.5 text-xs ml-1" : ""}
      ${!isMobile && !isHeaderMobile ? "px-4 py-2 ml-2" : ""}
    `}
  >
    <span className="relative z-10">{label}</span>
  </Link>
);

// --------------------- NAVBAR ---------------------
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false); // State for Modal

  const toggleMenu = () => setIsOpen(!isOpen);

  const navbarClasses =
    "fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md shadow-xl border-b border-zinc-800 transition-all duration-300";

  return (
    <>
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={turnesLogo}
                alt="Turnes Logo"
                className="h-8 md:h-9 w-auto object-contain logo-animated"
              />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <NavItem to="/" label="Inicio" />
              <NavItem
                to="#"
                label="Cómo funciona"
                isButton={true}
                onClick={() => setIsHowItWorksOpen(true)} // Open Modal
              />
              <NavItem to="/explorar" label="Características" />
              <NavItem to="/precios" label="Precios" />
              <NavItem to="/contacto" label="Contacto" />
            </div>

            {/* Buttons (Desktop & Mobile Visible) */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile: Compact Buttons */}
              <div className="flex md:hidden items-center mr-1">
                <AnimatedButton to="/login" label="Ingresar" isHeaderMobile={true} />
                <AnimatedButton to="/register" label="Regístrate" isHeaderMobile={true} />
              </div>

              {/* Desktop: Full Buttons (Hidden on Mobile to use custom layout above) */}
              <div className="hidden md:flex items-center space-x-3">
                <AnimatedButton to="/login" label="Ingresar" />
                <AnimatedButton to="/register" label="Regístrate" />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="md:hidden text-white p-1 rounded-md hover:text-brand-success focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-[#0a0a0a] border-t border-zinc-800 overflow-hidden"
            >
              <div className="flex flex-col space-y-1 px-4 py-6">
                <NavItem to="/" label="Inicio" isMobile={true} onClick={toggleMenu} />
                <NavItem
                  to="#"
                  label="Cómo funciona"
                  isMobile={true}
                  isButton={true}
                  onClick={() => { setIsHowItWorksOpen(true); toggleMenu(); }}
                />
                <NavItem to="/explorar" label="Características" isMobile={true} onClick={toggleMenu} />
                <NavItem to="/precios" label="Precios" isMobile={true} onClick={toggleMenu} />
                <NavItem to="/contacto" label="Contacto" isMobile={true} onClick={toggleMenu} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MODAL "CÓMO FUNCIONA" */}
      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </>
  );
};

export default Navbar;