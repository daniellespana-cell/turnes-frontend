import { m as motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Monitor, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Tabs (Internal Imports)
import ProfileTab from './tabs/ProfileTab';
import SecurityTab from './tabs/SecurityTab';
import NotificationsTab from './tabs/NotificationsTab';
import PreferencesTab from './tabs/PreferencesTab';
import SubscriptionTab from './tabs/SubscriptionTab';

// Configuration
const TABS_CONFIG = [
    { id: 'profile', label: 'Mi Perfil', icon: User, desc: 'Información personal y pública', component: ProfileTab },
    { id: 'security', label: 'Seguridad', icon: Shield, desc: 'Contraseña y verificación', component: SecurityTab },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, desc: 'Preferencias de alertas', component: NotificationsTab },
    { id: 'preferences', label: 'Preferencias', icon: Monitor, desc: 'Idioma y apariencia', component: PreferencesTab },
    { id: 'subscription', label: 'Suscripción', icon: Crown, desc: 'Gestiona tu facturación', component: SubscriptionTab },
];

const Configuracion = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTabId, setActiveTabId] = useState('profile');

    // 🛡️ FILTRADO SENIOR: Las pestañas se adaptan al rol del usuario
    const filteredTabs = React.useMemo(() => {
        return TABS_CONFIG.filter(tab => {
            if (tab.id === 'subscription') {
                return user?.role === 'empresa'; // Solo empresas ven suscripción
            }
            return true;
        });
    }, [user?.role]);

    // Derived state for cleaner render logic
    const ActiveComponent = filteredTabs.find(t => t.id === activeTabId)?.component || ProfileTab;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex font-manrope">
            {/* 1. DESKTOP SIDEBAR */}
            <DesktopSidebar 
                activeTabId={activeTabId} 
                onTabChange={setActiveTabId} 
                tabs={filteredTabs} 
            />

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto max-h-screen relative flex flex-col">

                {/* 3. MOBILE NAVIGATION (Sticky Header) */}
                <MobileNavigation 
                    activeTabId={activeTabId} 
                    onTabChange={setActiveTabId} 
                    tabs={filteredTabs} 
                />

                {/* 4. CONTENT RENDERER */}
                <div className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTabId}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ActiveComponent />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS (Clean & Scalable) ---

const DesktopSidebar = ({ activeTabId, onTabChange, tabs }) => {
    const navigate = useNavigate();
    return (
        <aside className="w-72 border-r border-white/5 bg-zinc-900/20 hidden md:flex flex-col h-screen sticky top-0">
            <div className="p-8 border-b border-white/5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-wider group"
                    type="button"
                    aria-label="Acción">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Volver
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Configuración
                </h1>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Administra tu cuenta y preferencias</p>
            </div>
            <nav className="flex-1 p-6 space-y-2">
                {tabs.map((tab) => (
                    <SidebarItem
                        key={tab.id}
                        tab={tab}
                        isActive={activeTabId === tab.id}
                        onClick={() => onTabChange(tab.id)}
                    />
                ))}
            </nav>
        </aside>
    );
};

const SidebarItem = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden text-left ${isActive
                ? 'bg-white/5 text-white shadow-sm ring-1 ring-white/10'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
            type="button"
            aria-label="Acción">
            {isActive && (
                <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"
                />
            )}
            <Icon size={20} className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
            <div className="flex-1">
                <p className={`text-sm font-bold ${isActive ? 'text-white' : ''}`}>{tab.label}</p>
                <p className="text-[10px] opacity-60 font-medium truncate max-w-[140px]">{tab.desc}</p>
            </div>
            {isActive && <ChevronRight size={16} className="text-emerald-500/50" />}
        </button>
    );
};

const MobileNavigation = ({ activeTabId, onTabChange, tabs }) => {
    const navigate = useNavigate();
    return (
        <div className="md:hidden sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl z-20 border-b border-white/5 shadow-sm">
            <div className="p-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-zinc-400 hover:text-white"
                    type="button"
                    aria-label="Acción">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-bold text-white">Configuración</h1>
            </div>
            <div className="flex overflow-x-auto px-2 pb-0 gap-2 no-scrollbar scroll-smooth">
                {tabs.map((tab) => {
                    const isActive = activeTabId === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1.5 pb-3 px-4 min-w-[80px] border-b-2 transition-all duration-300 ${isActive
                                ? 'border-emerald-500 text-emerald-400 translate-y-[1px]'
                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                                }`}
                            type="button"
                            aria-label="Acción">
                            <tab.icon size={22} className={isActive ? 'animate-pulse-slow' : ''} />
                            <span className={`text-[10px] font-bold whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Configuracion;
