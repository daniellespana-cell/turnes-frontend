import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BusinessSidebar from './BusinessSidebar';
import AppNavbar from './AppNavbar';

const BusinessLayout = ({ user }) => {
  // Estado que controla el ancho del sidebar para que el contenido "responda"
  const [isExpanded, setIsExpanded] = useState(true);
  // Estado para el sidebar móvil (Lifted State)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Detectar modo "Chat Nativo" para eliminar márgenes
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] relative">
      {/* Sidebar con lógica de expansión y responsive */}
      <BusinessSidebar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Contenedor principal: Se ajusta suavemente gracias a transition-all */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 w-full">
        <AppNavbar
          user={user}
          isSidebarExpanded={isExpanded}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Padding superior para no quedar debajo del Navbar */}
        {/* LÓGICA DE CHAT NATIVO: Si es chat, eliminamos padding y max-width para edge-to-edge */}
        <main className={`flex-1 ${useLocation().pathname.includes('/chat') ? 'pt-20 pb-0 px-0' : 'pt-24 pb-12 px-4 sm:px-6 lg:px-10'}`}>
          <div className={useLocation().pathname.includes('/chat') ? 'w-full h-full' : 'max-w-6xl mx-auto'}>
            {/* El Outlet hereda el usuario para las sub-páginas */}
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};


export default BusinessLayout;