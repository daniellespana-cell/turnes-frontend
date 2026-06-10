import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AssetResolver } from "../../utils/assetHelper";

const NavAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 py-1.5 focus:outline-none group active:scale-[0.98] transition-all duration-500"
      >

        <div className="hidden lg:flex flex-col items-end mr-0.5 relative z-10">
          <span className="text-[12px] font-bold text-zinc-200 group-hover:text-white transition-all duration-500 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {user.nombre_display || user.name || user.email?.split('@')[0] || 'Usuario'}
            {user.verificado && (
              <span className="ml-1 inline-flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full p-0.5 shadow-sm" title="Verificado">
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
              </span>
            )}
          </span>
          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.12em] group-hover:text-emerald-400 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {user.role}
          </span>
        </div>

        <div className="relative z-10">
          <div className="h-10 w-10 rounded-full p-[1px] bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/30 transition-all duration-700 shadow-[0_5px_15px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.2)]">
            <img
              src={
                AssetResolver.getAvatar(user.avatar_url || user.avatar) ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre_display || user.name || 'U')}&background=21c99a&color=fff&bold=true`
              }
              alt="Profile"
              className="h-full w-full rounded-full object-cover border border-[#0a0a0a]"
            />
          </div>
          {/* Status Indicator (Online) or Verified Badge */}
          {user.verificado ? (
            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-[2px] border-2 border-[#0a0a0a] shadow-[0_2px_10px_rgba(59,130,246,0.6)] z-20" title="Perfil Verificado">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          ) : (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.7)] z-20"></div>
          )}
        </div>
      </button>

      {/* The Modal / Dropdown Component */}
      <UserDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default NavAccount;