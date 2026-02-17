import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "./AppNavbar";
import Navbar from "./Navbar";
import Footer from "./Footer"; // Asumimos que tienes un componente Footer común

const MainLayout = () => {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Lógica Senior: Determinar si estamos en el Dashboard o área privada
  // Si la ruta empieza por /dashboard o /buscar, ocultamos el Footer de marketing
  const isPrivateArea = pathname.startsWith('/dashboard') || pathname.startsWith('/buscar') || pathname.startsWith('/plan-action');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-success"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-x-hidden">

      {/* 1. SWITCH DE NAVBAR ATÓMICO */}
      <div className="relative z-[100]">
        {user ? (
          <AppNavbar key="nav-private" user={user} />
        ) : (
          <Navbar key="nav-public" />
        )}
      </div>

      {/* 2. CONTENEDOR PRINCIPAL */}
      <main className="flex-grow pt-24 pb-12 bg-[#0a0a0a] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {/* Pasamos el usuario a través del context de Outlet para que esté disponible en las páginas */}
              <Outlet context={{ user }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 3. FOOTER CONDICIONAL 
          Solo se muestra en la Landing, Precios públicos, etc. 
          Se oculta automáticamente en el Dashboard y Upgrade Page.
      */}
      {!isPrivateArea && <Footer />}
    </div>
  );
};

export default MainLayout;