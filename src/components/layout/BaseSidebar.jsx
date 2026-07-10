import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, LogOut, Settings } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useNotificationsContext } from '../../context/NotificationsContext';
import turnesLogo from "../../assets/logo-turnes.png";
import { PATHS } from '../../config/routes.paths';

/**
 * 🧱 BASE SIDEBAR
 * Consolidated dynamic sidebar for both Roles.
 * Eliminates duplicate UI logic and standardizes navigation.
 */
const BaseSidebar = ({ menuItems, isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen }) => {
    const { logout } = useAuth();
    const { unreadCount } = useNotificationsContext();

    // Badge count resolver: maps badgeId to live data
    const getBadgeCount = (badgeId) => {
        if (badgeId === 'notifications') return unreadCount;
        return null;
    };

    return (
        <>
            {/* MOBILE OVERLAY */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
                    onClick={() => setIsMobileOpen(false)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={() => setIsMobileOpen(false)} />
            )}
            {/* SIDEBAR CORE: Borde Brillante Estilo Gemini */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-[115] bg-[#07080a] 
          border-r-[1.5px] border-emerald-500/10 shadow-[2px_0_15px_-3px_rgba(16,185,129,0.05)]
          transition-all duration-500 ease-out flex flex-col overflow-hidden
          ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'} 
          ${isExpanded ? 'md:w-64' : 'md:w-[4.5rem]'}
          md:sticky md:top-0 md:h-screen
        `}
            >
                {/* HEADER: LOGO */}
                <div className={`p-4 flex items-center h-20 shrink-0 ${isExpanded || isMobileOpen ? 'justify-between' : 'justify-center'}`}>
                    {(isExpanded || isMobileOpen) && (
                        <div className="flex items-center gap-3">
                            <div className="animate-in zoom-in duration-500">
                                <img src={turnesLogo} alt="Turnes" width="120" height="28" className="h-7 w-auto object-contain rounded-lg shadow-lg" />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-all items-center justify-center"
                        type="button"
                        aria-label="Acción">
                        <ChevronLeft size={16} className={`transition-transform duration-500 ${!isExpanded && 'rotate-180'}`} />
                    </button>
                </div>

                {/* NAVEGACIÓN PRINCIPAL */}
                <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {menuItems.map((item) => {
                        const count = item.badgeId ? getBadgeCount(item.badgeId) : null;
                        
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact || item.path === PATHS.BUSINESS.DASHBOARD || item.path === PATHS.BUSINESS.VACANCIES}
                                onClick={() => setIsMobileOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center rounded-xl transition-all duration-500 group relative overflow-hidden mb-1
                                    ${(isExpanded || isMobileOpen) ? 'px-4 py-3.5 md:py-4 space-x-4' : 'p-3 md:p-3.5 justify-center'}
                                    ${isActive
                                        ? 'bg-white/5 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-white/10'
                                        : 'text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-200'
                                    } 
                                `}
                                role="button"
                                tabIndex={0}
                                onKeyDown={() => setIsMobileOpen(false)}>
                                {({ isActive }) => (
                                    <>
                                        {/* Sutil Borde de Luz en Activo */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                                        )}

                                        <div className="relative">
                                            <item.icon
                                                size={20}
                                                className={`shrink-0 transition-all duration-500 relative z-10 ${isActive ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-300 group-hover:scale-110'}`}
                                                style={{
                                                    filter: isActive
                                                        ? 'drop-shadow(0 0 10px rgba(16,185,129,0.4))'
                                                        : 'none'
                                                }}
                                            />
                                            {/* Badge Móvil/Contraído */}
                                            {count > 0 && !(isExpanded || isMobileOpen) && (
                                                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#07080a]"></span>
                                                </span>
                                            )}
                                        </div>

                                        {(isExpanded || isMobileOpen) && (
                                            <span className={`flex-1 text-[14px] font-sans font-medium tracking-normal truncate animate-in slide-in-from-left-4 relative z-10 flex items-center justify-between ${isActive ? 'text-white font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'}`} style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}>
                                                <span className="truncate capitalize">{item.name.toLowerCase()}</span>
                                                {/* Badge Extendido */}
                                                {count > 0 && (
                                                     <span className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg ml-2 shrink-0">
                                                        {count > 99 ? '99+' : count}
                                                    </span>
                                                )}
                                            </span>
                                        )}

                                        {/* INDICADOR ACTIVO ESTILO GEMINI */}
                                        {isActive && (
                                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                        )}

                                        {/* TOOLTIP COLAPSADO (SOLO DESKTOP) */}
                                        {!isExpanded && !isMobileOpen && (
                                            <div className="hidden md:flex fixed left-[5.5rem] px-4 py-2.5 bg-[#0a0a0a] backdrop-blur-2xl text-white text-[13px] font-sans font-medium rounded-xl opacity-0 group-hover:opacity-100 border border-white/10 shadow-2xl transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none whitespace-nowrap z-[130] items-center gap-3 capitalize" style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}>
                                                {item.name.toLowerCase()}
                                                {count > 0 && (
                                                    <span className="bg-emerald-500 text-black px-1.5 rounded-md">
                                                        {count}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );})}
                </nav>

                {/* FOOTER: CONFIGURACIÓN Y CERRAR SESIÓN */}
                <div className="p-3 border-t border-white/5 shrink-0 flex flex-col gap-2">
                    <NavLink
                        to="/configuracion"
                        className={({ isActive }) => `
                        flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden
                        ${(isExpanded || isMobileOpen) ? 'px-3 py-2.5 md:py-3 space-x-3 w-full border border-transparent bg-zinc-900/50 hover:bg-white/10' : 'p-2.5 md:p-3 justify-center hover:bg-white/5'}
                        ${isActive ? 'bg-white/10 ring-1 ring-white/20' : ''}
                      `}
                    >
                        <Settings size={18} className="shrink-0 md:w-5 md:h-5 text-zinc-400 group-hover:text-white transition-colors" />

                        {(isExpanded || isMobileOpen) && (
                            <div className="flex flex-col items-start relative z-10 overflow-hidden">
                                <span className="font-sans font-medium text-[14px] text-zinc-300 group-hover:text-white transition-all truncate" style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}>
                                    Configuración
                                </span>
                            </div>
                        )}
                    </NavLink>

                    <button
                        onClick={logout}
                        className={`
                          flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden w-full
                          ${(isExpanded || isMobileOpen) ? 'px-3 py-2.5 md:py-3 space-x-3 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10' : 'p-2.5 md:p-3 justify-center hover:bg-white/5'}
                        `}
                        type="button"
                        aria-label="Acción">
                        <LogOut size={18} className="shrink-0 md:w-5 md:h-5 text-red-500/70 group-hover:text-red-500 transition-colors" />

                        {(isExpanded || isMobileOpen) && (
                            <span className="font-sans font-medium text-[14px] text-red-500/80 group-hover:text-red-500 transition-all truncate" style={{ fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif" }}>
                                Cerrar Sesión
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default BaseSidebar;
