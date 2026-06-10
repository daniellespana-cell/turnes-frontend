import React from 'react';
import { Filter, Frown, Send, Star, MapPin } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { talentService } from '../../services/talentService';
import { GeoService } from '../../services/geoService';
import { CIUDADES_COORDS } from '../../domain/geography.config';
import { AssetResolver } from '../../utils/assetHelper';

const InternalSearch = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isBusiness = user?.role === 'BUSINESS_ROLE';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Obtener parámetros de la URL
    const query = searchParams.get('q') || '';
    const locationStr = searchParams.get('loc') || '';

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                // Resolver coordenadas si hay ubicación
                let lat = null;
                let lng = null;
                
                if (locationStr) {
                    const searchName = locationStr.trim().toLowerCase();
                    const cityKey = Object.keys(CIUDADES_COORDS).find(k => k.toLowerCase() === searchName);
                    if (cityKey && CIUDADES_COORDS[cityKey]) {
                        lat = CIUDADES_COORDS[cityKey].lat;
                        lng = CIUDADES_COORDS[cityKey].lng;
                    }
                }

                if (isBusiness) {
                    // MODO EMPRESA: Buscar Talento (Candidatos)
                    const { data, error: rpcError } = await talentService.searchTalent(
                        lat || 7.0682,
                        lng || -73.1698,
                        query,
                        5 // Radio estricto de 5km
                    );

                    if (rpcError) throw rpcError;
                    
                    setResults(data.map(item => ({
                        id: item.id,
                        type: 'worker',
                        title: item.bio || 'Profesional de Turnes',
                        name: item.nombre_display,
                        location: locationStr || 'Cercano a ti',
                        price: '$ -- / turno',
                        rating: item.rating || 5.0,
                        tags: item.skills || [],
                        image: AssetResolver.getAvatar(item.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nombre_display)}&background=random`
                    })));

                } else {
                    // MODO CANDIDATO: Buscar Vacantes
                    const { data, error: rpcError } = await GeoService.fetchNearby(
                        lat || 7.0682,
                        lng || -73.1698,
                        5 // Radio estricto de 5km
                    );

                    if (rpcError) throw rpcError;

                    let filteredVacancies = data || [];
                    if (query) {
                        const lowQuery = query.toLowerCase();
                        filteredVacancies = filteredVacancies.filter(v => 
                            v.titulo?.toLowerCase().includes(lowQuery) || 
                            v.descripcion?.toLowerCase().includes(lowQuery) ||
                            v.categoria?.toLowerCase().includes(lowQuery)
                        );
                    }

                    setResults(filteredVacancies.map(v => ({
                        id: v.id,
                        type: 'job',
                        title: v.titulo,
                        name: v.empresa_nombre_comercial,
                        location: locationStr || 'Cercano',
                        price: `$${v.pago_monto?.toLocaleString() || '0'} / turno`,
                        rating: 4.9,
                        tags: [v.tipo_turno, v.modalidad, v.categoria].filter(Boolean),
                        image: AssetResolver.getAvatar(v.empresa_logo_url) || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'
                    })));
                }

            } catch (err) {
                console.error("Search fetch error:", err);
                setError("Hubo un error al cargar los resultados.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, locationStr, isBusiness]);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Cabecera Contextual */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">
                        {isBusiness ? "Talento para tu empresa" : "Turnos encontrados"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-zinc-500">
                            {loading ? "Buscando..." : `${results.length} resultados para tu búsqueda`}
                        </p>
                        {query && <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{query}</span>}
                        {locationStr && <span className="bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{locationStr}</span>}
                    </div>
                </div>
                
                <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-xl text-zinc-300 font-bold transition-all border border-transparent text-sm">
                    <Filter size={18} />
                    Refinar Búsqueda
                </button>
            </div>

            {/* Listado de Resultados */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Spinner size="lg" variant="emerald" />
                    <p className="text-zinc-500 font-bold animate-pulse">Consultando Red de Talento...</p>
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {results.map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                className="bg-zinc-900 border border-transparent p-6 rounded-3xl hover:border-brand-success/40 transition-all group flex flex-col relative overflow-hidden"
                            >
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-brand-success/5 blur-[60px] group-hover:bg-brand-success/10 transition-all rounded-full" />
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center border border-transparent group-hover:bg-brand-success/10 transition-colors overflow-hidden">
                                        <img 
                                            src={item.image} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=T&background=333&color=fff'; }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 bg-brand-success/10 px-2.5 py-1 rounded-lg text-brand-success text-xs font-black">
                                        <Star size={12} fill="currentColor" /> {item.rating}
                                    </div>
                                </div>
                                <div className="flex-grow z-10">
                                    <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-brand-success transition-colors">{item.title}</h3>
                                    <p className="text-zinc-400 font-bold text-sm mb-1">{item.name}</p>
                                    <div className="flex items-center gap-1 text-zinc-500 text-xs mb-4">
                                        <MapPin size={12} />
                                        {item.location}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {item.tags.slice(0, 4).map(tag => (
                                            <span key={tag} className="text-[9px] uppercase font-black bg-white/5 text-zinc-400 px-2 py-1 rounded-lg tracking-wider">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-5 border-t border-white/5 mt-auto z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Compensación</span>
                                        <span className="text-white font-black text-sm">{item.price}</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate(isBusiness ? `/dashboard/candidatos/${item.id}` : `/vacante/${item.id}`)}
                                        className="w-full py-3.5 bg-brand-success text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <Send size={18} />
                                        {isBusiness ? "Ver Perfil" : "Ver Detalles"}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-zinc-900/40 rounded-[2.5rem] border border-transparent flex flex-col items-center justify-center space-y-6"
                >
                    <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-700 mb-2">
                        <Frown size={40} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl">Sin resultados en esta zona</h3>
                        <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
                            No encontramos {isBusiness ? "candidatos" : "vacantes"} que coincidan con tu búsqueda en {locationStr || "tu área"}.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2.5 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all border border-transparent"
                    >
                        Volver al Dashboard
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default InternalSearch;