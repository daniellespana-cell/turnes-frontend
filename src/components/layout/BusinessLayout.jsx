import React from 'react';
import { Outlet } from 'react-router-dom';
import BaseSidebar from './BaseSidebar';
import AppNavbar from './AppNavbar';

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BUSINESS_MENU } from '../../config/navigation.config';

const BusinessLayout = ({ user }) => {
  // Estado que controla el ancho del sidebar para que el contenido "responda"
  const [isExpanded, setIsExpanded] = useState(true);
  // Estado para el sidebar móvil (Lifted State)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isChat = location.pathname.includes('/chat');

  // Detectar modo "Chat Nativo" para eliminar márgenes
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] relative">
      {/* Sidebar con lógica de expansión y responsive */}
      <BaseSidebar
        menuItems={BUSINESS_MENU}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Contenedor principal: Se ajusta suavemente gracias a transition-all */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 w-full">

        {/* NAVBAR: Solo visible en Dashboard Principal */}
        {isDashboard && (
          <AppNavbar
            user={user}
            isSidebarExpanded={isExpanded}
            onOpenMobileSidebar={() => setIsMobileOpen(true)}
          />
        )}

        {/* MOBILE TRIGGER: Para páginas internas donde no hay Navbar */}
        {(!isDashboard && !isChat) && (
          <div className="md:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="shrink-0 w-10 h-10 flex items-center justify-center !rounded-full bg-zinc-800 border border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 transition-all shadow-lg"
            >
              {/* Reutilizamos icono de Menu simple */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
            </button>
          </div>
        )}

        {/* Padding superior dinámico */}
        {/* LÓGICA DE PADDING: 
            - Chat: Súper compacto (pt-0 en modo nativo 100dvh)
            - Dashboard: pt-24 (Navbar height + gap)
            - Internas: pt-8 (Header mas arriba)
        */}
        <main className={`flex-1 ${isChat ? 'pt-0 pb-0 px-0' :
          isDashboard ? 'pt-24 pb-12 px-4 sm:px-6 lg:px-10' :
            'pt-8 pb-12 px-4 sm:px-6 lg:px-10'
          }`}>
          <div className={isChat ? 'w-full h-full' : 'max-w-6xl mx-auto'}>
            {/* El Outlet hereda el usuario para las sub-páginas */}
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};


export default BusinessLayout;