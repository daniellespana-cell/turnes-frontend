import React, { useMemo, useEffect } from 'react'; // Added useEffect
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useNavigate } from 'react-router-dom'; // Added Outlet, useNavigate
import { HelmetProvider } from 'react-helmet-async';
import { supabase } from './services/supabaseClient'; // IMPORT SUPABASE

/* =========================================================================
   0. AUTH LISTENER COMPONENT (Global)
   ========================================================================= */
const GlobalAuthListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Escucha eventos de Supabase como PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log("🔄 PASSWORD_RECOVERY Disparado -> Redirigiendo...");
        // Aseguramos que el usuario llegue a la pantalla de update
        navigate('/update-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <Outlet />; // Renderiza hijos
};

/* =========================================================================
   1. CONTEXT & PROVIDERS
   ========================================================================= */
import { useAuth } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';

/* =========================================================================
   2. LAYOUTS & SECURITY
   ========================================================================= */
import MainLayout from './components/layout/MainLayout';
import BusinessLayout from './components/layout/BusinessLayout';
import WorkerLayout from './components/layout/WorkerLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

/* =========================================================================
   3. PAGES: PUBLIC & AUTH
   ========================================================================= */
/* =========================================================================
   3. PAGES: PUBLIC & AUTH (STATIC - CRITICAL PATH)
   ========================================================================= */
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';

/* =========================================================================
   4. PAGES: STATIC & LEGAL (LAZY - LOW PRIORITY)
   ========================================================================= */
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const DetalleRolPage = React.lazy(() => import('./pages/DetalleRolPage'));
const PlanesPage = React.lazy(() => import('./pages/PlanesPage'));
const AcercaDe = React.lazy(() => import('./pages/AcercaDe'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PoliticaPagos = React.lazy(() => import('./pages/PoliticaPagos'));
const PoliticaPrivacidad = React.lazy(() => import('./pages/PoliticaPrivacidad'));
const TerminosServicio = React.lazy(() => import('./pages/TerminosServicio'));
const PoliticaUsuarios = React.lazy(() => import('./pages/PoliticaUsuarios'));

/* =========================================================================
   5. PAGES: SHARED PRIVATE (LAZY - PROTECTED)
   ========================================================================= */
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const InternalSearch = React.lazy(() => import('./pages/InternalSearch'));
const UpgradePlanPage = React.lazy(() => import('./pages/UpgradePlanPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));

/* =========================================================================
   6. PAGES: BUSINESS (LAZY - PROTECTED)
   ========================================================================= */
const WalletPage = React.lazy(() => import('./pages/business/WalletPage'));
const RechargePage = React.lazy(() => import('./pages/business/RechargePage'));
const CreateVacantePage = React.lazy(() => import('./pages/business/CreateVacantePage'));
const MisVacantesPage = React.lazy(() => import('./pages/business/MisVacantesPage'));
const DetalleVacantePage = React.lazy(() => import('./pages/business/DetalleVacantePage'));
const MisCandidatosPage = React.lazy(() => import('./pages/business/MisCandidatosPage'));
const FavoritosPage = React.lazy(() => import('./pages/business/FavoritosPage'));
const ProfilePage = React.lazy(() => import('./pages/business/ProfilePage'));
const ChatsPage = React.lazy(() => import('./pages/business/ChatsPage'));
const PlanActionPage = React.lazy(() => import('./pages/business/PlanActionPage'));

/* =========================================================================
   7. PAGES: WORKER (LAZY - PROTECTED)
   ========================================================================= */
const WorkerDashboard = React.lazy(() => import('./pages/worker/WorkerDashboard'));
const ExploreVacancies = React.lazy(() => import('./pages/worker/ExploreVacancies'));
const WorkerFinance = React.lazy(() => import('./pages/worker/WorkerFinance'));
const WorkerApplications = React.lazy(() => import('./pages/worker/WorkerApplications'));
const MyShifts = React.lazy(() => import('./pages/worker/MisTurnosPage'));
const WorkerChatsPage = React.lazy(() => import('./pages/worker/WorkerChatsPage'));
const WorkerProfile = React.lazy(() => import('./pages/worker/WorkerProfile'));

// --- HELPER COMPONENT: Dynamic Layout Switcher ---
const LayoutWrapper = ({ user, type }) => {
  if (type === 'business') return <BusinessLayout user={user} />;
  if (type === 'worker') return <WorkerLayout user={user} />;
  return <MainLayout user={user} key={user ? 'auth' : 'public'} />;
};

function App() {
  const { user, loading } = useAuth();

  // Logic: Determine Role Strategy
  const isBusiness = user?.role === 'empresa';
  const roleType = isBusiness ? 'business' : 'worker';

  const router = useMemo(() => {
    return createBrowserRouter([

      // -----------------------------------------------------------------------
      // A. ROOT LAYOUT (With Auth Listener)
      // -----------------------------------------------------------------------
      {
        path: "/",
        element: <GlobalAuthListener />,
        children: [
          // -----------------------------------------------------------------------
          // B. PUBLIC & AUTH
          // -----------------------------------------------------------------------
          {
            index: true, // Replaces path: "/"
            element: <LandingPage />,
          },
          {
            path: "login",
            element: user ? <Navigate to="/dashboard" replace /> : <LoginPage />,
          },
          {
            path: "forgot-password",
            element: user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />,
          },
          {
            path: "update-password",
            element: <UpdatePasswordPage />,
          },
          {
            path: "register",
            element: user ? <Navigate to="/dashboard" replace /> : <RegisterPage />,
          },

          // -----------------------------------------------------------------------
          // C. MAIN PUBLIC SHELL (Navbar + Footer)
          // -----------------------------------------------------------------------
          {
            element: <LayoutWrapper user={user} type="main" />,
            children: [
              { path: "search", element: <SearchPage /> },
              { path: "explorar", element: <ExplorePage /> },
              { path: "explorar/:rolSlug", element: <DetalleRolPage /> },
              { path: "precios", element: <PlanesPage /> },
              { path: "about", element: <AcercaDe /> },
              { path: "contacto", element: <ContactPage /> },
              // Legal
              { path: "politica-pagos", element: <PoliticaPagos /> },
              { path: "privacidad", element: <PoliticaPrivacidad /> },
              { path: "terminos", element: <TerminosServicio /> },
              { path: "politicas", element: <PoliticaUsuarios /> },
            ],
          },

          // -----------------------------------------------------------------------
          // D. PROTECTED DASHBOARD AREA (Sidebar + Header)
          // -----------------------------------------------------------------------
          {
            element: (
              <ProtectedRoute user={user}>
                <LayoutWrapper user={user} type={roleType} />
              </ProtectedRoute>
            ),
            children: [
              // 1. Root Dashboard (Smart Redirect)
              {
                path: "dashboard",
                element: isBusiness ? <DashboardPage /> : <WorkerDashboard />
              },

              // 2. Shared Routes
              { path: "buscar", element: <InternalSearch /> },
              { path: "dashboard/chat/:id", element: <ChatPage /> },

              // 3. Conditional Role Routes (RBAC Enforced)
              ...(isBusiness
                ? [ /* --- BUSINESS ROUTES --- */
                  { path: "dashboard/finanzas", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><WalletPage /></ProtectedRoute> },
                  { path: "dashboard/finanzas/recargar", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><RechargePage /></ProtectedRoute> },
                  { path: "dashboard/upgrade", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><UpgradePlanPage /></ProtectedRoute> },
                  { path: "dashboard/publicar", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><CreateVacantePage /></ProtectedRoute> },
                  { path: "dashboard/vacantes", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><MisVacantesPage /></ProtectedRoute> },
                  { path: "dashboard/vacantes/:id", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><DetalleVacantePage /></ProtectedRoute> },
                  { path: "dashboard/favoritos", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><FavoritosPage /></ProtectedRoute> },
                  { path: "dashboard/chats", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><ChatsPage /></ProtectedRoute> },
                  { path: "dashboard/candidatos", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><MisCandidatosPage /></ProtectedRoute> },
                  { path: "dashboard/perfil", element: <ProtectedRoute user={user} allowedRoles={['empresa']}><ProfilePage /></ProtectedRoute> },
                ]
                : [ /* --- WORKER ROUTES --- */
                  { path: "dashboard/explorar", element: <ProtectedRoute user={user} allowedRoles={['postulante']}><ExploreVacancies /></ProtectedRoute> },
                  { path: "dashboard/finanzas", element: <ProtectedRoute user={user} allowedRoles={['postulante']}><WorkerFinance /></ProtectedRoute> },
                  { path: "dashboard/turnos", element: <ProtectedRoute user={user} allowedRoles={['postulante']}><MyShifts /></ProtectedRoute> },
                  { path: "dashboard/postulaciones", element: <ProtectedRoute user={user} allowedRoles={['postulante']}><WorkerApplications /></ProtectedRoute> },
                  { path: "dashboard/chats", element: <ProtectedRoute user={user} allowedRoles={['postulante']}><WorkerChatsPage /></ProtectedRoute> },
                  { path: "dashboard/perfil", element: <ProtectedRoute user={user} allowedRoles={['postulante']}><WorkerProfile /></ProtectedRoute> },
                ]
              ),
            ],
          },

          // -----------------------------------------------------------------------
          // E. STANDALONE ROUTES
          // -----------------------------------------------------------------------
          {
            path: "plan-action/:planSlug",
            element: (
              <ProtectedRoute user={user}>
                <PlanActionPage />
              </ProtectedRoute>
            )
          },
          { path: "legal/terms", element: <TerminosServicio /> },
          { path: "legal/privacy", element: <PoliticaPrivacidad /> },

          // -----------------------------------------------------------------------
          // F. ERROR HANDLING
          // -----------------------------------------------------------------------
          { path: "404", element: <NotFound /> },
          { path: "*", element: <Navigate to="/404" replace /> },
        ]
      }
    ]);
  }, [user, isBusiness, roleType]);

  // Loading State
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center space-y-4 font-manrope">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"></div>
        <p className="text-white/60 font-medium animate-pulse tracking-widest text-xs uppercase italic">Sincronizando Turnes...</p>
      </div>
    );
  }

  // App Render
  return (
    <div className="App font-manrope antialiased bg-[#0a0a0a] min-h-screen">
      <HelmetProvider>
        <NotificationsProvider>
          <React.Suspense fallback={
            <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center font-manrope">
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500 animate-shimmer"></div>
              </div>
            </div>
          }>
            <RouterProvider router={router} />
          </React.Suspense>
        </NotificationsProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;