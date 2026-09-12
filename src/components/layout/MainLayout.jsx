import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import Navbar from './Navbar';
import Footer from './Footer';
import Spinner from '../ui/Spinner';

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MainLayout = () => {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Lógica Senior: Determinar si estamos en el Dashboard o área privada
  const isPrivateArea = pathname.startsWith('/dashboard') || pathname.startsWith('/buscar') || pathname.startsWith('/plan-action');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="md" variant="emerald" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden">

      {/* 1. SWITCH DE NAVBAR ATÓMICO */}
      <div className="relative z-[100]">
        {user ? (
          <AppNavbar key="nav-private" user={user} />
        ) : (
          <Navbar key="nav-public" />
        )}
      </div>

      {/* 2. CONTENEDOR PRINCIPAL FLUIDO (FULL-WIDTH NATIVO) */}
      <main className="flex-grow pt-16 bg-black relative z-10 w-full flex flex-col">
        <div key={pathname} className="w-full flex-grow flex flex-col">
          {/* Pasamos el usuario a través del context de Outlet para que esté disponible en las páginas */}
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* 3. FOOTER CONDICIONAL */}
      {!isPrivateArea && <Footer />}
    </div>
  );
};

export default MainLayout;
