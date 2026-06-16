import { motion } from 'framer-motion';
import { MessageCircle, MapPin, DollarSign, Calendar } from 'lucide-react';

import React from 'react';
import { formatCurrency } from '../../services/financeService';
import { AssetResolver } from '../../utils/assetHelper';

/**
 * WorkerApplicationCard (Premium 2026 UI - Dense Edition)
 * Componente modular extraído de WorkerApplications para mejorar rendimiento (React.memo)
 * y prevenir re-renders durante el scroll infinito.
 */
const WorkerApplicationCard = React.memo(({ app, onChat, onRate }) => {
    // Definición de estados (Lógica de negocio robusta)
    const isClosed = app.vacancyStatus === 'cerrada';
    const isWinner = app.status === 'contratado' || app.status === 'finalizado';

    let statusUI = {
        label: app.status,
        mainTheme: 'from-zinc-500 to-zinc-600',
        bgTag: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        glow: ''
    };
    let showChat = false;

    if (isClosed && !isWinner) {
        statusUI = {
            label: 'Cerrado • No Seleccionado',
            mainTheme: 'from-zinc-600 to-zinc-800',
            bgTag: 'bg-zinc-800/80 text-zinc-500 border-zinc-700/50',
            glow: ''
        };
        showChat = false;
    } else if (app.status === 'contratado') {
        statusUI = {
            label: 'Contratado • Turno Asignado',
            mainTheme: 'from-emerald-400 to-teal-500',
            bgTag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]'
        };
        showChat = true;
    } else if (app.status === 'chat_abierto' || app.status === 'en_progreso') {
        statusUI = {
            label: 'Paso 3 • Entrevista Activa',
            mainTheme: 'from-blue-400 to-indigo-500',
            bgTag: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            glow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]'
        };
        showChat = true;
    } else if (app.status === 'confirmado' || app.status === 'confirmed') {
        statusUI = {
            label: 'Paso 2 • Video Verificación',
            mainTheme: 'from-indigo-400 to-purple-500',
            bgTag: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
            glow: ''
        };
        showChat = false;
    } else if (app.status === 'pendiente_pago') {
        statusUI = {
            label: 'Paso 1 • En Revisión de Empresa',
            mainTheme: 'from-fuchsia-400 to-pink-500',
            bgTag: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
            glow: ''
        };
        showChat = false;
    } else if (app.status === 'finalizado') {
        statusUI = {
            label: 'Turno Completado',
            mainTheme: 'from-brand-primary to-teal-400',
            bgTag: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
            glow: 'shadow-[0_0_15px_rgba(20,184,166,0.1)]'
        };
        showChat = false;
    } else {
        statusUI = {
            label: 'Postulación Pendiente',
            mainTheme: 'from-amber-400 to-orange-500',
            bgTag: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            glow: ''
        };
        showChat = false;
    }

    const isFaded = isClosed && !isWinner;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className={`group relative w-full rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 md:bg-transparent md:hover:bg-[#09090b]/50 border border-transparent md:border-transparent md:hover:border-white/5
                ${isFaded ? 'opacity-40 hover:opacity-100 grayscale-[0.8] hover:grayscale-0' : 'hover:-translate-y-0.5'}
            `}
        >
            {/* Fondo Base en Móvil (muy oscuro), transparente en Desktop hasta Hover */}
            <div className="absolute inset-0 bg-[#09090b]/40 md:bg-transparent group-hover:bg-[#09090b]/60 transition-colors duration-300 rounded-2xl md:rounded-3xl" />

            {/* Mesh Gradient Sutil (casi invisible hasta hover) */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${statusUI.mainTheme} opacity-0 group-hover:opacity-[0.08] blur-[20px] transition-opacity duration-700 pointer-events-none rounded-full`} />

            <div className="relative p-3 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-5">

                {/* ─── Izquierda: Avatar e Info ─── */}
                <div className="flex gap-3 md:gap-4 items-start w-full">
                    {/* Avatar Super Compacto */}
                    <div className="shrink-0 w-9 h-9 md:w-12 md:h-12 rounded-xl bg-black border border-transparent flex items-center justify-center overflow-hidden relative shadow-sm">
                        <img 
                            src={AssetResolver.getAvatar(app.companyLogo, app.company || 'Empresa Confidencial')} 
                            alt={app.company} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out grayscale-[0.2] group-hover:grayscale-0" 
                        />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                        {/* Header con Título y Estado */}
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm md:text-base font-bold text-zinc-100 tracking-tight truncate group-hover:text-white transition-colors">
                                {app.titulo || app.role || 'Rol Confidencial'}
                            </h3>
                            {/* Estado en Escritorio (Derecha del título) */}
                            <span className={`hidden md:inline-flex px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded text-right whitespace-nowrap shrink-0 opacity-80 group-hover:opacity-100 transition-opacity ${statusUI.bgTag}`}>
                                {statusUI.label}
                            </span>
                        </div>

                        {/* Subtítulo (Empresa) */}
                        <p className="text-zinc-500 text-[10px] md:text-xs font-medium mb-1.5 md:mb-2 truncate">
                            {app.company || app.empresa_nombre || 'Corporación Privada'}
                        </p>

                        {/* Metadatos (Ultra Sutiles) */}
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[9px] md:text-[10px] text-zinc-500 font-medium">
                            {app.price > 0 && (
                                <div className="flex items-center gap-1 shrink-0 text-amber-500/70 group-hover:text-amber-500/90 transition-colors">
                                    <DollarSign size={10} strokeWidth={2.5} />
                                    <span className="font-bold tracking-wide">{formatCurrency(app.price)}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1 shrink-0">
                                <Calendar size={10} strokeWidth={2} className="opacity-70" />
                                <span className="uppercase tracking-wider">{app.fullDate || 'Sin Fecha'}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 truncate max-w-[100px] md:max-w-none">
                                <MapPin size={10} strokeWidth={2} className="opacity-70" />
                                <span className="truncate">{app.address?.split(',')[0] || 'Ubicación'}</span>
                            </div>
                        </div>

                        {/* Estado en Móvil (Abajo) */}
                        <div className="mt-2 md:hidden">
                            <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded shrink-0 opacity-80 ${statusUI.bgTag}`}>
                                {statusUI.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Derecha: Acciones Super Compactas ─── */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-end gap-2 w-full md:w-auto mt-1 md:mt-0 pt-2 md:pt-0 border-t border-white/5 md:border-0 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">

                    {/* Botón de Chat */}
                    {showChat && (
                        <button
                            onClick={onChat}
                            className="text-brand-primary p-2 hover:bg-brand-primary/10 rounded-lg hover:scale-105 active:scale-95 transition-all"
                            title="Ir al chat con la empresa"
                        >
                            <MessageCircle size={16} strokeWidth={2.5} />
                        </button>
                    )}

                    {/* Botón de Calificar Empresa */}
                    {app.status === 'finalizado' && !app.protocolState?.candidato_rated && (
                        <button
                            onClick={() => onRate(app)}
                            className="flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[8px] md:text-[9px] border border-transparent md:border-transparent md: rounded-lg transition-all text-center"
                        >
                            Calificar
                        </button>
                    )}

                    {/* Badge Valoración Enviada */}
                    {app.status === 'finalizado' && app.protocolState?.candidato_rated && (
                        <span className="flex-1 md:flex-none flex items-center justify-center gap-1 px-2.5 py-1 text-emerald-500/70 font-bold uppercase tracking-widest text-[8px] opacity-70 cursor-default">
                            ✔ Lista
                        </span>
                    )}

                </div>
            </div>
        </motion.div>
    );
});

export default WorkerApplicationCard;
