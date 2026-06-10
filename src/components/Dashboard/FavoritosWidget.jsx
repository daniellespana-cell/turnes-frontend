import React from 'react';
import { Star, Zap, ChevronRight, History, UserPlus } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import { AssetResolver } from '../../utils/assetHelper';

const FavoritosWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [favoritos, setFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavs = async () => {
            if (!user?.id) return;
            try {
                const data = await CandidateService.getFavoritos(user.id);
                // Solo mostramos los últimos 5 para no saturar
                setFavoritos(data.slice(0, 5));
            } catch (e) {
                console.error("Error loading favorites widget", e);
            } finally {
                setLoading(false);
            }
        };
        loadFavs();
    }, [user?.id]);

    if (loading) return <div className="h-40 animate-pulse bg-white/5 rounded-2xl" />;

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                        <History className="text-yellow-500" size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">Recontratación Rápida</h3>
                </div>
                {favoritos.length > 0 && (
                    <button
                        onClick={() => navigate('/dashboard/favoritos')}
                        className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition-colors uppercase font-bold tracking-wider"
                    >
                        Ver todos <ChevronRight size={12} />
                    </button>
                )}
            </div>

            {favoritos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {favoritos.map((staff) => (
                        <div
                            key={staff.id}
                            onClick={() => navigate(`/dashboard/chat/${staff.id}`)}
                            className="group relative bg-[#0a0a0a] border border-transparent hover:border-yellow-500/30 p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-900/50 cursor-pointer flex flex-col items-center text-center"
                        >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Zap size={12} className="text-yellow-500 fill-yellow-500" />
                            </div>

                            <div className="relative mb-3">
                                <img
                                    src={AssetResolver.getAvatar(staff.avatarUrl || staff.avatar_url || staff.avatar) || `https://ui-avatars.com/api/?name=${staff.name}&background=random`}
                                    className="w-12 h-12 rounded-full border border-transparent group-hover:border-yellow-500/50 transition-colors bg-zinc-800 object-cover"
                                    alt={staff.name}
                                />
                                {staff.verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-[2px] rounded-full ring-2 ring-black">
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                )}
                            </div>

                            <h4 className="text-[10px] font-bold text-zinc-200 uppercase tracking-tight truncate w-full">
                                {staff.name ? staff.name.split(' ')[0] : 'Talento'}
                                {staff.name?.split(' ')[1] ? ` ${staff.name.split(' ')[1][0]}.` : ''}
                            </h4>
                            <p className="text-[9px] text-zinc-500 truncate w-full mt-0.5 mb-2">{staff.role}</p>

                            <div className="w-full py-1.5 bg-white/5 group-hover:bg-yellow-500 group-hover:text-black rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all">
                                Recontratar
                            </div>
                        </div>
                    ))}

                    {/* Card "Ver Más" si hay suficientes */}
                    <div
                        onClick={() => navigate('/dashboard/favoritos')}
                        className="hidden md:flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors px-4 py-8"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                            <ChevronRight size={14} />
                        </div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase text-center">Gestionar Staff</span>
                    </div>
                </div>
            ) : (
                /* ESTADO VACÍO ELEGANTE (Placeholder Senior) */
                <div className="group relative w-full overflow-hidden border border-dashed border-white/5 rounded-2xl p-8 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-transparent flex items-center justify-center text-zinc-600 group-hover:text-yellow-500 transition-colors duration-500">
                                <UserPlus size={20} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0a0a0a] border border-transparent rounded-full flex items-center justify-center">
                                <History size={10} className="text-zinc-500" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-xs font-bold text-zinc-400">Sin historial de contratación aún</p>
                            <p className="text-[10px] text-zinc-500 max-w-[240px] leading-relaxed">
                                Los talentos que contrates y califiques aparecerán aquí para una recontratación en un solo clic.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/buscar-talento')}
                            className="mt-2 px-4 py-1.5 bg-zinc-800 hover:bg-white/10 text-white !rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                            Explorar Talento
                        </button>
                    </div>
                    {/* Sutil gradiente de fondo */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>
            )}
        </div>
    );
};

export default FavoritosWidget;
