import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Search, Calendar,
    Briefcase, User, LogOut, ChevronLeft,
    CircleDollarSign, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import turnesLogo from "../../assets/logo-turnes.png";

const WorkerSidebar = ({ isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen }) => {
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Inicio', icon: LayoutDashboard, path: '/dashboard', exact: true },
        { name: 'Mi Perfil', icon: User, path: '/dashboard/perfil' },
        { name: 'Explorar', icon: Search, path: '/dashboard/explorar' },
        { name: 'Mis Postulaciones', icon: Briefcase, path: '/dashboard/postulaciones' },
        { name: 'Mensajes', icon: MessageCircle, path: '/dashboard/chats' },
        { name: 'Mis Finanzas', icon: CircleDollarSign, path: '/dashboard/finanzas' },
        { name: 'Historial de Turnos', icon: Calendar, path: '/dashboard/turnos' },


    ];

    return (
        <>
            {/* MOBILE OVERLAY */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* SIDEBAR CORE */}
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
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-lg shadow-lg animate-in zoom-in duration-500">
                                <img src={turnesLogo} alt="Turnes" className="h-4 w-auto object-contain" />
                            </div>
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
                            end={item.exact}
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
                                        className={`shrink-0 transition-transform duration-300 relative z-10 ${isActive ? 'text-white drop-shadow-md' : 'text-zinc-500 group-hover:text-zinc-300 group-hover:scale-105'}`}
                                    />

                                    {(isExpanded || isMobileOpen) && (
                                        <span className={`text-xs font-medium tracking-wide whitespace-nowrap animate-in slide-in-from-left-2 relative z-10 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
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

                {/* FOOTER: CERRAR SESIÓN (Adaptado al estilo Premium) */}
                <div className="p-3 border-t border-white/5 shrink-0">
                    <button
                        onClick={logout}
                        className={`
              flex items-center rounded-xl transition-all duration-500 group relative overflow-hidden w-full
              ${(isExpanded || isMobileOpen) ? 'px-3 py-3 space-x-3 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10' : 'p-2.5 justify-center hover:bg-white/5'}
            `}
                    >
                        {/* Gradient Background Effect */}
                        {(isExpanded || isMobileOpen) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        )}

                        <LogOut size={18} className="shrink-0 text-red-400/70 group-hover:text-red-400 transition-colors" />

                        {(isExpanded || isMobileOpen) && (
                            <span className="font-bold text-[11px] text-red-400/80 uppercase tracking-wider group-hover:tracking-widest transition-all">
                                Cerrar Sesión
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default WorkerSidebar;
