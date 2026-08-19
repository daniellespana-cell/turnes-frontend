import React from 'react';
import { MoreHorizontal, Trash2, Edit3, Copy, Users, Rocket } from 'lucide-react';

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VacanteRow = ({ data, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);



  return (
    <div className="relative group/row" ref={menuRef}>
      {/* ---------------------------------------------------------------------------
          DESKTOP VIEW (Visible md+)
         --------------------------------------------------------------------------- */}
      <div className="hidden md:grid grid-cols-12 items-center px-6 py-5 border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">

        {/* INFO PRINCIPAL */}
        <div className="col-span-5 flex items-center gap-4">
          <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'Activa' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-zinc-700'}`} />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-white text-sm font-medium tracking-tight">{data.title}</h3>
                {data.esUrgente && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[8px] font-black uppercase tracking-widest animate-pulse">
                        <Rocket size={8} /> Impulsado
                    </span>
                )}
            </div>
            <span className="text-[9px] text-zinc-600 uppercase tracking-[0.15em] font-bold">{data.type}</span>
          </div>
        </div>

        {/* STATUS */}
        <div className="col-span-2 flex justify-center">
          <span className={`text-[9px] font-bold uppercase tracking-widest py-1 px-3 rounded-full ${data.status === 'Activa' ? 'text-emerald-500 bg-emerald-500/5' :
            data.status === 'Completada' ? 'text-blue-500 bg-blue-500/5' :
              'text-zinc-600 bg-zinc-800/20'
            }`}>
            {data.status}
          </span>
        </div>

        {/* FECHA */}
        <div className="col-span-1 text-center">
          <span className="text-[10px] text-zinc-600 font-mono">{data.date}</span>
        </div>

        {/* COSTO */}
        <div className="col-span-1 text-center">
          <span className={`text-[10px] font-bold tracking-tight ${data.status === 'Completada' ? 'text-zinc-700 opacity-50' : 'text-zinc-500'}`}>
            {data.cost}
          </span>
        </div>

        {/* ACCIONES */}
        <div className="col-span-3 flex justify-end items-center gap-4">
          {data.status === 'Completada' ? (
            <span className="text-[10px] text-zinc-600 font-medium italic px-4">Ciclo Cerrado</span>
          ) : data.applicants > 0 ? (
            <button
              onClick={() => navigate(`/dashboard/vacantes/${data.id}`)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all group/btn"
              type="button"
              aria-label="Acción">
              <span className="text-[10px] font-bold uppercase tracking-widest">Ver {data.applicants} Postulantes</span>
            </button>
          ) : (
            <span className="text-[10px] text-zinc-700 font-medium italic px-4">Sin postulantes</span>
          )}


          {/* DESKTOP MENU TRIGGER */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-full transition-all ${showMenu ? 'text-white bg-white/10' : 'text-zinc-700 hover:text-white hover:bg-white/5'}`}
              type="button"
              aria-label="Acción">
              <MoreHorizontal size={16} />
            </button>
            {showMenu && <DropdownMenu data={data} onAction={onAction} setShowMenu={setShowMenu} />}
          </div>
        </div>
      </div>
      {/* ---------------------------------------------------------------------------
          MOBILE VIEW (Visible < md)
         --------------------------------------------------------------------------- */}
      <div className="md:hidden border border-transparent bg-zinc-900/20 rounded-2xl p-5 mb-4 relative backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -z-10" />

        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1.5 pr-8">
            <h3 className="text-white text-lg font-bold leading-tight tracking-tight">{data.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-white/5 px-2 py-0.5 rounded-md">{data.type}</span>
            </div>
          </div>

          {/* MOBILE MENU TRIGGER */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1">

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-lg active:scale-95 transition-all"
                type="button"
                aria-label="Acción">
                <MoreHorizontal size={18} />
              </button>
              {showMenu && <DropdownMenu data={data} onAction={onAction} setShowMenu={setShowMenu} />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-black/40 border border-transparent">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Estado</span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'Activa' ? 'bg-emerald-500 shadow-[0_0_5px_#10B981]' : 'bg-zinc-600'}`} />
              <span className={`text-xs font-bold ${data.status === 'Activa' ? 'text-emerald-400' : 'text-zinc-400'}`}>{data.status}</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-1 p-2.5 rounded-xl bg-black/40 border border-transparent">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Costo</span>
              <span className="text-xs font-bold text-zinc-300">{data.cost}</span>
            </div>
            <div className="w-full h-px bg-white/5 my-1" />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Fecha</span>
              <span className="text-[10px] font-mono text-zinc-400">{data.date}</span>
            </div>
          </div>
        </div>

        {data.status === 'Completada' ? (
          <div className="w-full py-2.5 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            <span className="text-[10px] text-zinc-600 font-medium italic">Ciclo Cerrado</span>
          </div>
        ) : data.applicants > 0 ? (
          <button
            onClick={() => navigate(`/dashboard/vacantes/${data.id}`)}
            className="w-full relative group overflow-hidden flex justify-center items-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-blue-500/10 border border-blue-500/20 text-blue-400 active:scale-[0.98] transition-all"
            type="button"
            aria-label="Acción">
            <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Users size={14} />
            <span className="relative z-10 text-[11px] font-black uppercase tracking-widest">Ver {data.applicants} Postulantes</span>
          </button>
        ) : (
          <div className="w-full py-2.5 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            <span className="text-[10px] text-zinc-600 font-medium italic">Sin postulantes aún</span>
          </div>
        )}
      </div>
    </div>
  );
};

const MenuBtn = ({ icon, label, onClick, danger }) => (
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all text-left ${danger ? 'text-red-500 hover:bg-red-500/10' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`}
    type="button"
    aria-label="Acción">
    {icon} <span>{label}</span>
  </button>
);

const DropdownMenu = ({ data, onAction, setShowMenu }) => (
  <div className="absolute right-0 top-full mt-2 w-48 bg-[#09090b] border border-transparent rounded-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
    {data.status !== 'Completada' && (
      <>
        <MenuBtn
          icon={<Edit3 size={14} />}
          label="Editar"
          onClick={() => { onAction?.(data.id, 'edit'); setShowMenu(false); }}
          role="button"
          tabIndex={0}
          onKeyDown={() => { onAction?.(data.id, 'edit'); setShowMenu(false); }} />
        <MenuBtn
          icon={<Copy size={14} />}
          label="Duplicar"
          onClick={() => { onAction?.(data.id, 'duplicate'); setShowMenu(false); }}
          role="button"
          tabIndex={0}
          onKeyDown={() => { onAction?.(data.id, 'duplicate'); setShowMenu(false); }} />
        <div className="h-px bg-white/5 my-1 mx-2" />
      </>
    )}
    <MenuBtn
      icon={<Trash2 size={14} />}
      label="Eliminar"
      danger
      onClick={() => { onAction?.(data.id, 'delete-confirm'); setShowMenu(false); }}
      role="button"
      tabIndex={0}
      onKeyDown={() => { onAction?.(data.id, 'delete-confirm'); setShowMenu(false); }} />
  </div>
);

export default VacanteRow;