import { Suspense } from 'react';
import { PageLoadingBar, GlobalAuthListener } from './RouterComponents';

 
import React from 'react';
import { 
    createBrowserRouter, 
    Navigate,
    Outlet
} from 'react-router-dom';
import { PATHS } from '../config/routes.paths';
import { rootLoader } from './loaders';
import { useAuth } from '../context/AuthContext';
import { GlobalLoading } from './RouterComponents';
import { RouterErrorBoundary } from '../components/error/RouterErrorBoundary';

// Layouts & Security
import MainLayout from '../components/layout/MainLayout';
import BusinessLayout from '../components/layout/BusinessLayout';
import WorkerLayout from '../components/layout/WorkerLayout';

/* =========================================================================
   PAGES (STATIC - CRITICAL PATH)
   ========================================================================= */
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import UpdatePasswordPage from '../pages/auth/UpdatePasswordPage';
import AuthCallback from '../pages/auth/AuthCallback';
import NotFound from '../pages/common/NotFound';

// Layout components
import ProtectedRoute from '../components/auth/ProtectedRoute';
import GuestRoute from '../components/auth/GuestRoute';
import CookieBanner from '../components/common/cookies/CookieBanner';
import CookieSentinel from '../components/common/cookies/CookieSentinel';
import CookieTrigger from '../components/common/cookies/CookieTrigger';

/* =========================================================================
   PAGES (LAZY)
   ========================================================================= */
const DashboardPage = React.lazy(() => import('../pages/common/DashboardPage'));
const WorkerDashboard = React.lazy(() => import('../pages/worker/WorkerDashboard'));
const WalletPage = React.lazy(() => import('../pages/business/WalletPage'));
const WorkerFinance = React.lazy(() => import('../pages/worker/WorkerFinance'));
const ExploreVacancies = React.lazy(() => import('../pages/worker/ExploreVacancies'));
const WorkerApplications = React.lazy(() => import('../pages/worker/WorkerApplications'));
const WorkerRatings = React.lazy(() => import('../pages/worker/WorkerRatings'));
const WorkerProfile = React.lazy(() => import('../pages/worker/WorkerProfile'));
const MisVacantesPage = React.lazy(() => import('../pages/business/MisVacantesPage'));
const CreateVacantePage = React.lazy(() => import('../pages/business/CreateVacantePage'));
const TalentSearchPage = React.lazy(() => import('../pages/business/TalentSearchPage'));
const BusinessChatPage = React.lazy(() => import('../pages/business/BusinessChatPage'));
const WorkerChatPage = React.lazy(() => import('../pages/worker/WorkerChatPage'));
const ChatsPage = React.lazy(() => import('../pages/business/ChatsPage'));
const WorkerChatsPage = React.lazy(() => import('../pages/worker/WorkerChatsPage'));
const NotificationsPage = React.lazy(() => import('../pages/common/NotificationsPage'));
const ConfiguracionPage = React.lazy(() => import('../pages/common/ConfiguracionPage'));
const ExplorePage = React.lazy(() => import('../pages/public/ExplorePage'));
const SearchPage = React.lazy(() => import('../pages/public/SearchPage'));
const DetalleRolPage = React.lazy(() => import('../pages/public/DetalleRolPage'));
const PlanesPage = React.lazy(() => import('../pages/common/PlanesPage'));
const AcercaDe = React.lazy(() => import('../pages/public/AcercaDe'));
const ContactPage = React.lazy(() => import('../pages/public/ContactPage'));
const Pagos = React.lazy(() => import('../pages/legal/Pagos'));
const Privacidad = React.lazy(() => import('../pages/legal/Privacidad'));
const Terminos = React.lazy(() => import('../pages/legal/Terminos'));
const Usuarios = React.lazy(() => import('../pages/legal/Usuarios'));
const CookiePolicyPage = React.lazy(() => import('../pages/legal/CookiePolicyPage'));
const DetalleVacantePage = React.lazy(() => import('../pages/business/DetalleVacantePage'));
const MisCandidatosPage = React.lazy(() => import('../pages/business/MisCandidatosPage'));
const FavoritosPage = React.lazy(() => import('../pages/business/FavoritosPage'));
const RechargePage = React.lazy(() => import('../pages/business/RechargePage'));
const BusinessProfile = React.lazy(() => import('../pages/business/ProfilePage'));
const TransactionStatusPage = React.lazy(() => import('../pages/business/TransactionStatusPage'));
const UpgradePlanPage = React.lazy(() => import('../pages/common/UpgradePlanPage'));
const PlanActionPage = React.lazy(() => import('../pages/business/PlanActionPage'));
const InternalSearch = React.lazy(() => import('../pages/common/InternalSearch'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const VerificationQueuePage = React.lazy(() => import('../pages/admin/VerificationQueuePage'));
const VerificationDetailPage = React.lazy(() => import('../pages/admin/VerificationDetailPage'));
const AdminUsersPage = React.lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminFinancesPage = React.lazy(() => import('../pages/admin/AdminFinancesPage'));
const VerificationFlowPage = React.lazy(() => import('../pages/verification/VerificationFlowPage'));
const AdminLayout = React.lazy(() => import('../components/layout/AdminLayout'));
const BusinessRatings = React.lazy(() => import('../pages/business/BusinessRatings'));

/* =========================================================================
   SPECIALIZED COMPONENTS
   ========================================================================= */

/**
 * 🛡️ HYDRATION BARRIER
 * Role-decision components MUST wait for the DB profile (via RPC) before
 * committing to a route or layout. The JWT shell carries stale metadata
 * (e.g., user_metadata.rol = 'empresa' even if perfiles.rol = 'admin'),
 * so rendering before hydration causes the wrong layout/redirect.
 *
 * This helper centralizes the guard so every dispatcher/guard is consistent.
 */
const useHydratedUser = () => {
    const auth = useAuth();
    const isReady = !auth.loading && (!auth.user || auth.user.is_hydrated);
    return { ...auth, isReady };
};

/**
 * DASHBOARD DISPATCHER
 * Encapsulates role logic inside the component tree, keeping routes static.
 * Waits for hydration to avoid routing with stale JWT metadata.
 */
const DashboardDispatcher = () => {
    const { user, isReady } = useHydratedUser();
    if (!isReady) return <PageLoadingBar />;
    if (!user) return <Navigate to={PATHS.PUBLIC.LOGIN} replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return user.role === 'empresa' ? <DashboardPage /> : <WorkerDashboard />;
};

/**
 * RATINGS DISPATCHER
 * Routes the /dashboard/calificaciones to the correct page based on role.
 */
const RatingsDispatcher = () => {
    const { user, isReady } = useHydratedUser();
    if (!isReady) return <PageLoadingBar />;
    if (!user) return <Navigate to={PATHS.PUBLIC.LOGIN} replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return user.role === 'empresa' ? <BusinessRatings /> : <WorkerRatings />;
};

/**
 * 🛡️ CHAT DISPATCHER (Restaurado para Máxima Velocidad)
 * Abre el chat inmediatamente para evitar bloqueos en Match y Notificaciones.
 */
const ChatDispatcher = () => {
    const { user, isReady } = useHydratedUser();
    if (!isReady) return <PageLoadingBar />;
    return user?.role === 'empresa' ? <BusinessChatPage /> : <WorkerChatPage />;
};

/**
 * SMART CHATS DISPATCHER
 */
const ChatsDispatcher = () => {
    const { user, isReady } = useHydratedUser();
    if (!isReady) return <PageLoadingBar />;
    return user?.role === 'empresa' ? <ChatsPage /> : <WorkerChatsPage />;
};

/**
 * ROLE GUARD
 * Prevents cross-role access to private pages.
 * Redirects to /dashboard if the user's role doesn't match the allowed role.
 */
const RoleGuard = ({ allowedRole, children }) => {
    const { user, isReady } = useHydratedUser();
    if (!isReady) return <PageLoadingBar />;
    if (!user) return <Navigate to={PATHS.PUBLIC.LOGIN} replace />;
    if (user.role !== allowedRole) return <Navigate to="/dashboard" replace />;
    return children;
};

/**
 * ADMIN GUARD
 * Solo usuarios con role='admin' en perfiles tienen acceso.
 */
const AdminGuard = ({ children }) => {
    const { user, isReady } = useHydratedUser();
    if (!isReady) return <PageLoadingBar />;
    if (!user) return <Navigate to={PATHS.PUBLIC.LOGIN} replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
};


/**
 * AUTH SYNC BRIDGE
 * Shows the global loading spinner until AuthContext's onAuthStateChange
 * fires and sets authReady (loading → false). Acts as a pure passthrough after that.
 */
const AuthSyncBridge = () => {
    const { loading } = useAuth();

    if (loading) return <GlobalLoading />;

    return (
        <>
            <CookieSentinel />
            <CookieBanner />
            <CookieTrigger />
            <Outlet />
        </>
    );
};

/**
 * LAYOUT DISPATCHER
 * Chooses the correct sidebar layout based on role.
 * Must also wait for hydration to avoid mounting the wrong layout shell.
 */
const LayoutDispatcher = ({ forceType = null }) => {
    const { user, isReady } = useHydratedUser();

    // For forced types (e.g., public shell), skip hydration wait
    if (!forceType && !isReady) return <PageLoadingBar />;

    const roleType = forceType || (user?.role === 'admin' ? 'admin' : user?.role === 'empresa' ? 'business' : 'worker');
    const Layout = roleType === 'business' ? BusinessLayout : roleType === 'worker' ? WorkerLayout : MainLayout;

    return (
        <Layout user={user}>
            <div className="w-full h-full text-white">
                <Suspense fallback={<PageLoadingBar />}>
                    <Outlet />
                </Suspense>
            </div>
        </Layout>
    );
};

/* =========================================================================
   STATIC ROUTER DEFINITION (SINGLETON)
   ========================================================================= */
export const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthSyncBridge />, 
        errorElement: <RouterErrorBoundary />,
        loader: rootLoader,
        HydrateFallback: GlobalLoading,
        id: "root",
        children: [
            {
                element: <GlobalAuthListener />,
                children: [
                    // 1. PUBLIC LANDING & AUTH (Guest Only)
                    {
                        element: <GuestRoute><Outlet /></GuestRoute>,
                        children: [
                            { index: true, element: <LandingPage /> },
                            { path: PATHS.PUBLIC.LOGIN, element: <LoginPage /> },
                            { path: PATHS.PUBLIC.REGISTER, element: <RegisterPage /> },
                            { path: PATHS.PUBLIC.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
                        ]
                    },
                    { path: PATHS.PUBLIC.UPDATE_PASSWORD, element: <UpdatePasswordPage /> },
                    { path: '/auth/callback', element: <AuthCallback /> },

                    // 2. PUBLIC SHELL (Navbar + Footer) - Guest Only
                    {
                        element: (
                            <GuestRoute>
                                <LayoutDispatcher forceType="main" />
                            </GuestRoute>
                        ),
                        children: [
                            { path: PATHS.PUBLIC.SEARCH, element: <SearchPage /> },
                            { path: PATHS.PUBLIC.EXPLORE, element: <ExplorePage /> },
                            { path: PATHS.SHARED.ROLE_DETAIL(':rolSlug'), element: <DetalleRolPage /> },
                            { path: PATHS.PUBLIC.PRICING, element: <PlanesPage /> },
                            { path: PATHS.PUBLIC.ABOUT, element: <AcercaDe /> },
                            { path: PATHS.PUBLIC.CONTACT, element: <ContactPage /> },
                            { path: PATHS.PUBLIC.LEGAL.PAYMENTS, element: <Pagos /> },
                            { path: PATHS.PUBLIC.LEGAL.PRIVACY, element: <Privacidad /> },
                            { path: PATHS.PUBLIC.LEGAL.TERMS, element: <Terminos /> },
                            { path: PATHS.PUBLIC.LEGAL.USERS, element: <Usuarios /> },
                            { path: PATHS.PUBLIC.LEGAL.COOKIES, element: <CookiePolicyPage /> },
                        ]
                    },

                    // 3. PROTECTED PLATFORM (Sidebar + Header)
                    {
                        element: (
                            <ProtectedRoute>
                                <LayoutDispatcher />
                            </ProtectedRoute>
                        ),
                        children: [
                            { path: 'dashboard', element: <DashboardDispatcher /> },
                            { path: 'buscar', element: <InternalSearch /> },
                            { path: 'dashboard/chat/:id', element: <ChatDispatcher /> },
                            { path: 'dashboard/notifications', element: <NotificationsPage /> },

                            { path: 'dashboard/chats', element: <ChatsDispatcher /> },

                            // --- BUSINESS ROUTES ---
                            { path: 'dashboard/perfil', element: <RoleGuard allowedRole="empresa"><BusinessProfile /></RoleGuard> },
                            { path: 'wallet', element: <WalletPage /> },
                            { path: 'dashboard/finanzas/recargar', element: <RechargePage /> },
                            { path: 'dashboard/finanzas/success', element: <TransactionStatusPage /> },
                            { path: 'dashboard/upgrade', element: <UpgradePlanPage /> },
                            { path: 'publicar', element: <CreateVacantePage /> },
                            { path: 'dashboard/vacantes', element: <MisVacantesPage /> },
                            { path: 'dashboard/vacantes/:id', element: <DetalleVacantePage /> },
                            { path: 'dashboard/favoritos', element: <FavoritosPage /> },
                            { path: 'candidatos', element: <MisCandidatosPage /> },
                            { path: 'dashboard/buscar-talento', element: <TalentSearchPage /> },

                            // --- WORKER ROUTES (Role-Guarded) ---
                            { path: 'dashboard/explorar',      element: <RoleGuard allowedRole="postulante"><ExploreVacancies /></RoleGuard> },
                            { path: 'dashboard/finanzas',      element: <WorkerFinance /> }, // Role-aware content inside
                            { path: 'dashboard/postulaciones', element: <RoleGuard allowedRole="postulante"><WorkerApplications /></RoleGuard> },
                            { path: 'dashboard/calificaciones',element: <RatingsDispatcher /> },
                            { path: 'perfil',                  element: <RoleGuard allowedRole="postulante"><WorkerProfile /></RoleGuard> },
                        ]
                    },

                    // 4. ADMIN ROUTES
                    {
                        path: 'admin',
                        element: <AdminGuard><Suspense fallback={<PageLoadingBar />}><AdminLayout /></Suspense></AdminGuard>,
                        children: [
                            { index: true, element: <Suspense fallback={<PageLoadingBar />}><AdminDashboard /></Suspense> },
                            { path: 'verificaciones', element: <Suspense fallback={<PageLoadingBar />}><VerificationQueuePage /></Suspense> },
                            { path: 'verificaciones/:id', element: <Suspense fallback={<PageLoadingBar />}><VerificationDetailPage /></Suspense> },
                            { path: 'usuarios', element: <Suspense fallback={<PageLoadingBar />}><AdminUsersPage /></Suspense> },
                            { path: 'transacciones', element: <Suspense fallback={<PageLoadingBar />}><AdminFinancesPage /></Suspense> },
                        ]
                    },

                    // 5. VERIFICATION FLOW (authenticated user)
                    {
                        path: 'verificacion/documentos',
                        element: <ProtectedRoute><Suspense fallback={<PageLoadingBar />}><VerificationFlowPage /></Suspense></ProtectedRoute>
                    },

                    // 6. SPECIAL ROUTES
                    {
                        path: 'plan-action/:planSlug',
                        element: <ProtectedRoute><PlanActionPage /></ProtectedRoute>
                    },
                    {
                        path: 'configuracion',
                        element: <ProtectedRoute><ConfiguracionPage /></ProtectedRoute>
                    },

                    // 5. ERROR 404
                    { path: '404', element: <NotFound /> },
                    { path: '*', element: <Navigate to="/404" replace /> }
                ]
            }
        ]
    }
]);
