import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Crown, MessageCircle } from 'lucide-react';
import NotificationsMenu from '../navbar/NotificationsMenu';
import NavAccount from './NavAccount';
import RechargeButton from '../finance/RechargeButton';
import { useNavbarVisibility } from '../../hooks/useNavbarVisibility';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import turnesLogo from "../../assets/logo-turnes.png";
import { useSyncExternalStore, useMemo } from 'react';
import { ChatStorage } from '../../services/chat';
const AppNavbar = ({ user, isSidebarExpanded, onOpenMobileSidebar }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { showExtraActions } = useNavbarVisibility();

  if (!user) return null;

  const isBusiness       = user.role === "empresa";
  const userPlan         = (user.plan || 'Básico').toLowerCase();
  const isProOrEnterprise = ['pro', 'enterprise'].some(p => userPlan.startsWith(p));
  const showUpgradeButton = isBusiness && !isProOrEnterprise;
  const upgradeTarget     = userPlan.includes('micro') ? 'Pro' : 'Premium';

  const chatSnapshot = useSyncExternalStore(ChatStorage.subscribe, ChatStorage.getSnapshot);
  const unreadMessages = useMemo(() => {
    if (!chatSnapshot?.unreadCounts) return 0;
    return Object.values(chatSnapshot.unreadCounts).reduce((acc, count) => acc + count, 0);
  }, [chatSnapshot?.unreadCounts]);
  // 3D 4K SENIOR EFFECT FOR RAW ICONS (No Box/Pill Contour)
  const iconBtnClass = "relative flex items-center justify-center transition-all duration-500 group active:scale-[0.85] focus:outline-none p-2";
  const iconSvgClass = "w-6 h-6 text-zinc-300 drop-shadow-[0_5px_8px_rgba(0,0,0,0.9)] filter group-hover:text-white group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-500 transform group-hover:-translate-y-0.5";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#060606] border-b border-zinc-800/50 transition-all duration-500 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative gap-2">

          <div className="flex items-center gap-2 md:gap-4">
            {/* 1. Mobile Menu Button - 3D Spherical */}
            <div className="md:hidden flex items-center text-white shrink-0">
              <button onClick={onOpenMobileSidebar} className={iconBtnClass}>
                <Menu className={iconSvgClass} strokeWidth={2.5} />
              </button>
            </div>

            {/* 2. Logo Section */}
            <Link to="/dashboard" className="flex-shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <img src={turnesLogo} alt="Turnes" className="h-6 md:h-8 w-auto object-contain brightness-110" />
            </Link>
          </div>

          <div className="flex-1"></div>

          {/* 5. Actions Section */}
          <div className="flex items-center gap-1 md:gap-4 relative flex-none justify-end">
            {/* Chat Icon */}
            <button
              onClick={() => navigate('/dashboard/chats')}
              className={iconBtnClass}
              title="Mensajes"
            >
              <MessageCircle
                className={iconSvgClass}
                strokeWidth={2.5}
                style={{
                  filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.9)) drop-shadow(0 -1px 1px rgba(255,255,255,0.08))'
                }}
              />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 text-white text-[10px] font-black rounded-full shadow-[0_0_12px_rgba(168,85,247,0.6),0_2px_4px_rgba(0,0,0,0.5)] z-20 pointer-events-none ring-2 ring-[#060606] px-1 leading-none">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="shrink-0 flex items-center justify-center">
              <NotificationsMenu />
            </div>

            {/* Recharge — solo empresa */}
            {isBusiness && showExtraActions && (
              <RechargeButton className="h-9 px-0 md:px-4 text-[10px]" />
            )}

            {/* Upgrade — solo empresa en plan básico */}
            {showUpgradeButton && showExtraActions && (
              <button
                onClick={() => navigate("/dashboard/upgrade")}
                title="Hazte Premium"
                className="shrink-0 group relative flex items-center justify-center focus:outline-none active:scale-90 transition-transform duration-200"
              >
                {/* Mobile: icono solo */}
                <span className="md:hidden relative flex items-center justify-center w-9 h-9 rounded-full">
                  <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-60" style={{ animationDuration: '2.5s' }} />
                  <span className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-zinc-900/80 border border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.15)]">
                    <Crown size={15} className="text-amber-400 group-active:scale-90 transition-transform" strokeWidth={2.5} />
                  </span>
                </span>
                {/* Desktop: Aurora pill */}
                <span
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full relative overflow-hidden"
                  style={{
                    background: 'rgba(10,8,4,0.8)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    boxShadow: '0 0 20px -5px rgba(245,158,11,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                  }}
                >
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.08) 50%, rgba(245,158,11,0.12) 100%)' }}
                  />
                  <span className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                  <Crown size={13} className="relative z-10 text-amber-400" strokeWidth={2.5} />
                  <span className="relative z-10 text-[10px] font-black tracking-[0.18em] uppercase text-amber-400/90 group-hover:text-amber-300 transition-colors">
                    Subir a {upgradeTarget}
                  </span>
                </span>
              </button>
            )}

            {/* NavAccount */}
            <div className="relative z-50 shrink-0">
              <NavAccount />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;