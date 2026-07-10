import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Shield, LogOut, Menu, X } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, TrendingUp, Verified, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { label: 'Verificaciones', icon: Verified, path: '/admin/verificaciones' },
    { label: 'Usuarios', icon: Users, path: '/admin/usuarios' },
    { label: 'Transacciones', icon: TrendingUp, path: '/admin/transacciones' },
];

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Cierra el menú al navegar
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-[#040404] font-manrope text-white overflow-hidden">
            {/* Backdrop Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        key="mobile-overlay-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>
            {/* Sidebar Superior (Logo & Title) */}
            <aside className={`fixed md:relative top-0 left-0 w-72 md:w-64 h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shadow-sm shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Shield size={16} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-tight leading-tight">Turnes</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Admin Panel</p>
                        </div>
                    </div>
                    {/* Botón para cerrar en móvil */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-2 text-zinc-500 hover:text-white bg-white/5 rounded-lg"
                        aria-label="Cerrar Menú"
                        type="button">
                        <X size={16} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        // Match index ('/admin') vs nested ('/admin/algo')
                        const isActive = item.path === '/admin' 
                            ? location.pathname === '/admin' 
                            : location.pathname.startsWith(item.path);

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group
                                    ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                                `}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeAdminTab" 
                                        className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                                    />
                                )}
                                <item.icon size={18} className={`relative z-10 ${isActive ? 'text-blue-400' : ''}`} />
                                <span className={`text-sm font-bold relative z-10 ${isActive ? '' : ''}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout Footer */}
                <div className="p-4 border-t border-white/5 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
                        type="button"
                        aria-label="Acción">
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col overflow-hidden bg-[#040404]">
                
                {/* Mobile Header (Only visible on small screens) */}
                <div className="md:hidden h-16 shrink-0 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-4 z-30">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-blue-400" />
                        <span className="font-black text-white text-sm tracking-tight">System Admin</span>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 border border-white/5 bg-zinc-900/50 rounded-xl text-zinc-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        aria-label="Abrir Menú de Navegación"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Contenedor escrolleable interno (las páginas ya asumen control del scroll, pero por seguridad) */}
                <div className="flex-1 overflow-y-auto w-full h-full relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
