import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AssetResolver } from "../../utils/assetHelper";
const planNames = {
  'basic': 'Plan Básico',
  'micro': 'Plan Micro',
  'pro': 'Pro Business'
};

const NavAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Lógica Senior: Mapeo estético para mostrar el nombre del plan correctamente
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del Perfil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none p-1 rounded-full hover:bg-white/10 transition-colors"
        type="button"
        aria-label="Acción">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white">{user.name}</p>
          {/* Mostramos el rol ya normalizado por el AuthContext */}
          <p className="text-xs text-brand-success font-semibold capitalize">
            {user.role}
          </p>
        </div>
        <img
          src={AssetResolver.getAvatar(user?.avatar_url || user?.avatar || user?.avatarUrl, user?.name || user?.email || 'User')}
          alt="Profile"
          className="h-9 w-9 rounded-full border-2 border-brand-success object-cover"
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-[#121212] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
          {user.role === 'empresa' && (
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Estado de Cuenta</p>
              <p className="text-sm font-bold text-brand-success mt-0.5">
                {planNames[user.planId] || 'Plan Básico'}
              </p>
            </div>
          )}

          <div className="py-1">
            <Link
              to="/dashboard/perfil"
              className="block px-4 py-2 text-sm text-white/80 hover:bg-brand-success/10 hover:text-brand-success transition-colors"
              onClick={() => setIsOpen(false)}
              role="button"
              tabIndex={0}
              onKeyDown={() => setIsOpen(false)}>
              Mi Perfil
            </Link>
            <Link
              to="/configuracion"
              className="block px-4 py-2 text-sm text-white/80 hover:bg-brand-success/10 transition-colors"
              onClick={() => setIsOpen(false)}
              role="button"
              tabIndex={0}
              onKeyDown={() => setIsOpen(false)}>
              Configuración
            </Link>
          </div>

          <div className="border-t border-white/5 mt-1 pt-1">
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium"
              type="button"
              aria-label="Acción">
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavAccount;