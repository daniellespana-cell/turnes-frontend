import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import turnesLogo from "../../assets/logo-turnes.png";
import { useSearchBar } from "../../hooks/useSearchBar";
import DesktopSearchBar from "../navbar/DesktopSearchBar";
import NotificationsMenu from "../navbar/NotificationsMenu";
import NavAccount from "./NavAccount";

const AppNavbar = ({ user, isSidebarExpanded, onOpenMobileSidebar }) => {
  // States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Safety Check
  if (!user) return null;

  // Logic
  const searchConfig = useSearchBar(user.role);
  const isBusiness = user.role === "empresa";
  const isBasic = user.planId === "basic";
  const showUpgradeButton = isBusiness && isBasic;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md shadow-xl border-b border-zinc-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative gap-2"> {/* Added gap for overall spacing */}

          {/* 1. Mobile Menu Button (Left Side - Replacing Logo on Mobile) */}
          <div className="md:hidden flex items-center text-white shrink-0 mr-1">
            <button onClick={onOpenMobileSidebar} className="p-1">
              <div className="rounded-full bg-zinc-800 p-1.5 border border-zinc-700/50"><Menu size={20} /></div>
            </button>
          </div>

          {/* 2. Logo Section (Desktop Only) */}
          <Link to="/dashboard" className="hidden md:block flex-shrink-0">
            <img src={turnesLogo} alt="Turnes" className="h-9 w-auto object-contain" />
          </Link>

          {/* 3. MOBILE SEARCH BAR (Center & Expanded) */}
          <div className="md:hidden flex-1 mx-1 max-w-[280px]"> {/* Increased max-width for "a bit larger" */}
            <DesktopSearchBar
              placeholder="Buscar..."
              {...searchConfig}
            />
          </div>

          {/* 4. Desktop Search Bar (Center) */}
          <div className={`hidden md:flex flex-1 justify-center px-8 transition-all duration-500 ease-in-out ${isSidebarExpanded ? 'max-w-md' : 'max-w-2xl'}`}>
            <DesktopSearchBar
              placeholder={isBusiness ? "Busca candidatos..." : "Busca turnos..."}
              {...searchConfig}
            />
          </div>

          {/* 5. Actions Section (Right Side) */}
          <div className="flex items-center space-x-1 md:space-x-12 relative flex-none justify-end">

            {/* Chat Icon */}
            <button
              onClick={() => navigate('/dashboard/chats')}
              className="relative p-1.5 md:p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors z-30 group"
              title="Mensajes"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 md:w-[22px] md:h-[22px] group-hover:text-purple-400 transition-colors"
                style={{ filter: "drop-shadow(0px 0px 5px rgba(168, 85, 247, 0.2))" }}
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              {/* Fake unread badge */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 border-2 border-[#0a0a0a] rounded-full" />
            </button>

            {/* Notifications Menu */}
            <div className="scale-90 md:scale-100 origin-center">
              <NotificationsMenu />
            </div>

            {/* Upgrade Button */}
            {showUpgradeButton && (
              <button
                onClick={() => navigate("/dashboard/upgrade")}
                className="group relative flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)] active:scale-95 shrink-0"
              >
                <Crown size={14} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="hidden md:block text-[11px] font-bold text-zinc-300 group-hover:text-white uppercase tracking-widest transition-colors">
                  Hazte Premium
                </span>
              </button>
            )}

            {/* Account Menu (Desktop Only) */}
            <div className="hidden md:block relative z-50">
              <NavAccount />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content Removed: Logic is handled by BusinessSidebar */}
    </nav>
  );
};

export default AppNavbar;