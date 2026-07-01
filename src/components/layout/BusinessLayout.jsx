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

  const isMobileMenuOpen = isMobileOpen;
  const setIsMobileMenuOpen = setIsMobileOpen;

  return (
    <div className="flex min-h-[100dvh] bg-[#0a0a0a] relative">
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

        {/* NAVBAR: Visible en todas partes (su contenido interno decide qué muestra) */}
        {!isChat && (
          <AppNavbar
            user={user}
            isSidebarExpanded={isExpanded}
            onOpenMobileSidebar={() => setIsMobileOpen(true)}
          />
        )}

        {/* Padding superior dinámico */}
        {/* LÓGICA DE PADDING: 
            - Chat: Súper compacto (pt-0 en modo nativo 100dvh)
            - Dashboard: pt-24 (Navbar height + gap)
            - Internas: pt-8 (Header mas arriba)
        */}
        <main 
          className={`flex-1 ${isChat ? 'pt-0 pb-0 px-0' : 'pt-24 pb-12 px-4 sm:px-6 lg:px-10'}`}
          style={{ paddingTop: isChat ? 'env(safe-area-inset-top)' : 'calc(6rem + env(safe-area-inset-top))' }}
        >
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