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
  // Si la ruta empieza por /dashboard o /buscar, ocultamos el Footer de marketing
  const isPrivateArea = pathname.startsWith('/dashboard') || pathname.startsWith('/buscar') || pathname.startsWith('/plan-action');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Spinner size="md" variant="emerald" />
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
          <div key={pathname}>
            {/* Pasamos el usuario a través del context de Outlet para que esté disponible en las páginas */}
            <Outlet context={{ user }} />
          </div>
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