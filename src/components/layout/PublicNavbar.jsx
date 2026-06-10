import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DesktopSearchBar from '../navbar/DesktopSearchBar';
import MobileSearchBar from '../navbar/MobileSearchBar';

import { useState } from "react";

import turnesLogo from "../../assets/logo-turnes.png";

import { useAuth } from "@/context/AuthContext"; // Importante para la seguridad
import { useSearchBar } from "@/hooks/useSearchBar";

const PublicNavbar = () => {
  const { user, loading } = useAuth(); // Obtenemos el estado global
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const toggleMenu = () => setMobileOpen(!mobileOpen);
  const search = useSearchBar();

  // --- ESCUDO DE SEGURIDAD ---
  // Si está cargando o ya hay un usuario, este Navbar NO DEBE existir en el DOM.
  // Esto evita que se vea de fondo en el Dashboard o al recargar.
  if (loading || user) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between py-3 md:h-20 gap-4">

          {/* LOGO + TOGGLE */}
          <div className="w-full md:w-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src={turnesLogo} alt="Turnes Logo" className="h-8 object-contain" />
            </Link>

            <button 
              onClick={toggleMenu} 
              className="md:hidden text-zinc-300 p-1 rounded-md hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* BUSCADOR (Desktop) */}
          <DesktopSearchBar {...search} />

          {/* NAVEGACIÓN (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/explorar" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              Explorar
            </Link>
            <Link to="/precios" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
              Planes
            </Link>
          </nav>

        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {mobileOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 overflow-hidden">
          <div className="px-4 py-6 space-y-6">
            {/* BUSCADOR (Mobile) */}
            <MobileSearchBar {...search} />
            {/* ENLACES (Mobile) */}
            <div className="flex flex-col space-y-4">
              <Link onClick={toggleMenu} to="/" className="text-white text-lg">Inicio</Link>
              <Link onClick={toggleMenu} to="/explorar" className="text-white text-lg">Explorar Categorías</Link>
              <Link onClick={toggleMenu} to="/precios" className="text-white text-lg">Planes</Link>
              <Link onClick={toggleMenu} to="/contacto" className="text-white text-lg">Contacto</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;