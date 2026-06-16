import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Camera } from 'lucide-react';

import {
    User,
    CreditCard
} from 'lucide-react';
import { useUserMenu } from '../../hooks/useUserMenu';
import { AssetResolver } from '../../utils/assetHelper';

const UserDropdown = ({ isOpen, onClose }) => {
    const { user, logout, badge } = useUserMenu();

    if (!user) return null;

    return (
        <>
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 origin-top-right z-50">
                    <div className="bg-[#0f0f11]/95 backdrop-blur-xl border border-transparent rounded-2xl  overflow-hidden ring-1 ring-white/5 mx-2 md:mx-0">
                        {/* Header Section (Compact) */}
                        <div className="p-3 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                            <div className="flex items-center gap-3 relative z-10">
                                <Link
                                    to="/dashboard/perfil"
                                    onClick={onClose}
                                    className="relative group/avatar cursor-pointer block shrink-0"
                                >
                                    <img
                                        src={AssetResolver.getAvatar(user?.avatar_url || user?.avatar, user?.nombre_display || user?.name || 'U')}
                                        alt="Profile"
                                        className="h-10 w-10 rounded-xl object-cover shadow-md border border-transparent"
                                    />
                                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-[1px]">
                                        <Camera size={14} className="text-white" />
                                    </div>
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-bold truncate">
                                        {user.nombre_display || user.name || 'Usuario'}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 truncate mb-1">{user.email}</p>
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest leading-none ${badge.color}`}>
                                        {badge.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items (Compact) */}
                        <div className="p-1.5 space-y-0.5">
                            <MenuItem
                                to={user?.role === 'empresa' ? '/dashboard/perfil' : '/perfil'}
                                icon={User}
                                label="Mi Perfil"
                                onClick={onClose}
                            />
                            <MenuItem
                                to={user?.role === 'empresa' ? '/dashboard/finanzas' : '/dashboard/finanzas'}
                                icon={CreditCard}
                                label={user?.role === 'empresa' ? 'Mis Pagos' : 'Billetera'}
                                onClick={onClose}
                            />
                        </div>

                        {/* Footer / Logout (Compact) */}
                        <div className="p-1.5 border-t border-white/5 bg-black/20">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group/logout"
                            >
                                <LogOut size={14} />
                                <span className="text-xs font-bold">Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Helper Component for UI consistency (Compact)
const MenuItem = ({ to, icon: Icon, label, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors group"
    >
        <div className="p-1.5 rounded-md bg-zinc-900 text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-colors border border-transparent group-">
            <Icon size={14} />
        </div>
        <div>
            <p className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                {label}
            </p>
        </div>
    </Link>
);

export default UserDropdown;
