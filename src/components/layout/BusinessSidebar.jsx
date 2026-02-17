import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Briefcase, HeartHandshake,
  Megaphone, CircleDollarSign, Building2, LogOut, Sparkles,
  ChevronLeft, Menu, X, UserCircle // Importamos UserCircle para el perfil
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import turnesLogo from "../../assets/logo-turnes.png";

const BusinessSidebar = ({ isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen }) => {
  const { logout } = useAuth();
  // Local state removed in favor of props

  const menuItems = [
    { name: 'Panel de Control', icon: Home, path: '/dashboard' },

    // 🔥 NUEVO ITEM AGREGADO:
    { name: 'Perfil Empresa', icon: UserCircle, path: '/dashboard/perfil' },

    { name: 'Publicar Vacante', icon: Megaphone, path: '/dashboard/publicar' },
    { name: 'Mis Vacantes', icon: Briefcase, path: '/dashboard/vacantes' },
    { name: 'Finanzas', icon: CircleDollarSign, path: '/dashboard/finanzas' },
    { name: 'Red de Confianza', icon: HeartHandshake, path: '/dashboard/candidatos' }, // Corregí el nombre para consistencia
  ];

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* 1. BOTÓN MÓVIL REMOVED (Controlled by AppNavbar) */}

      {/* 2. OVERLAY MÓVIL */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 3. SIDEBAR CORE */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[115] bg-[#0a0a0a] border-r border-white/5 
          transition-all duration-500 ease-out flex flex-col overflow-hidden
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} 
          ${isExpanded ? 'md:w-60' : 'md:w-[4.5rem]'}
          md:sticky md:top-0 md:h-screen
        `}
      >
        {/* HEADER: LOGO */}
        <div className={`p-4 flex items-center h-20 shrink-0 ${isExpanded || isMobileOpen ? 'justify-between' : 'justify-center'}`}>
          {(isExpanded || isMobileOpen) && (
            <div className="bg-white p-1.5 rounded-lg shadow-lg animate-in zoom-in duration-500">
              <img src={turnesLogo} alt="Turnes" className="h-4 w-auto object-contain" />
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-all items-center justify-center"
          >
            <ChevronLeft size={16} className={`transition-transform duration-500 ${!isExpanded && 'rotate-180'}`} />
          </button>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center rounded-lg transition-all duration-300 group relative overflow-hidden
              ${(isExpanded || isMobileOpen) ? 'px-3 py-2.5 space-x-3' : 'p-2.5 justify-center'}
              ${isActive
                  ? 'bg-zinc-800/50 text-white font-bold shadow-inner ring-1 ring-white/10'
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'} 
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Sutil Shimmer (Estela Plateada) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                  <item.icon
                    size={18}
                    className={`shrink - 0 transition - transform duration - 300 relative z - 10 ${isActive ? 'text-white drop-shadow-md' : 'text-zinc-500 group-hover:text-zinc-300 group-hover:scale-105'}`}
                  />

                  {(isExpanded || isMobileOpen) && (
                    <span className={`text - xs font - medium tracking - wide whitespace - nowrap animate -in slide -in -from - left - 2 relative z - 10 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                      {item.name}
                    </span>
                  )}

                  {/* INDICADOR ACTIVO (Más sutil) */}
                  {isActive && (isExpanded || isMobileOpen) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80 rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                  )}

                  {/* TOOLTIP COLAPSADO */}
                  {!isExpanded && !isMobileOpen && (
                    <div className="fixed left-20 px-3 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg opacity-0 group-hover:opacity-100 border border-white/10 shadow-2xl transition-opacity pointer-events-none whitespace-nowrap z-[130]">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER: CONFIGURACIÓN (GEMINI STYLE) */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <NavLink
            to="/dashboard/configuracion"
            className={({ isActive }) => `
              flex items - center rounded - xl transition - all duration - 500 group relative overflow - hidden
              ${(isExpanded || isMobileOpen) ? 'px-3 py-3 space-x-3 w-full border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10' : 'p-2.5 justify-center hover:bg-white/5'}
          ${isActive ? 'bg-purple-500/10 border-purple-500/40' : ''}
            `}
          >
            {/* Gemini Gradient Background Effect */}
            {(isExpanded || isMobileOpen) && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            )}

            <Sparkles size={18} className="shrink-0 text-purple-400 group-hover:text-purple-300 transition-colors" />

            {(isExpanded || isMobileOpen) && (
              <div className="flex flex-col items-start relative z-10">
                <span className="font-bold text-[11px] text-white uppercase tracking-wider group-hover:tracking-widest transition-all">
                  Configuración
                </span>
                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  Ajustes & IA
                </span>
              </div>
            )}
          </NavLink>
        </div>
      </aside >
    </>
  );
};

export default BusinessSidebar;