import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Filter, Frown, Send, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// --- IMPORTACIÓN DE DATOS ---
// Reutilizamos los mismos datos o unos más específicos para usuarios
import { MOCK_RESULTS } from '../data/mockData';

const InternalSearch = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const isBusiness = user?.role === 'BUSINESS_ROLE';

    // 1. Obtener parámetros de la URL
    const query = searchParams.get('q') || '';
    const location = searchParams.get('loc') || '';

    // 2. Filtrado Inteligente
    const filteredResults = useMemo(() => {
        return MOCK_RESULTS.filter(item => {
            const matchQuery = query 
                ? item.title.toLowerCase().includes(query.toLowerCase()) || 
                  item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                : true;

            const matchLocation = location
                ? item.location.toLowerCase().includes(location.toLowerCase())
                : true;

            return matchQuery && matchLocation;
        });
    }, [query, location]);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Cabecera Contextual */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">
                        {isBusiness ? "Talento para tu empresa" : "Turnos encontrados"}
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        {filteredResults.length} resultados para tu búsqueda actual.
                    </p>
                </div>
                
                <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-xl text-zinc-300 font-bold transition-all border border-white/5 text-sm">
                    <Filter size={18} />
                    Refinar Búsqueda
                </button>
            </div>

            {/* Listado de Resultados Privados */}
            {filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResults.map((item, idx) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-zinc-900 border border-white/5 p-6 rounded-3xl hover:border-brand-success/40 transition-all group flex flex-col"
                        >
                            {/* Header de la Card */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-14 w-14 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-brand-success/10 transition-colors">
                                    <span className="text-2xl">{isBusiness ? "👤" : "🏢"}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-brand-success/10 px-2.5 py-1 rounded-lg text-brand-success text-xs font-black">
                                    <Star size={12} fill="currentColor" /> 4.9
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow">
                                <h3 className="text-white font-bold text-lg leading-tight mb-1">{item.title}</h3>
                                <p className="text-zinc-500 text-sm mb-4">{item.location}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-bold bg-white/5 text-zinc-400 px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Footer de la Card con Acción Real */}
                            <div className="pt-5 border-t border-white/5 mt-auto">
                                <button className="w-full py-3.5 bg-brand-success text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2">
                                    <Send size={18} />
                                    {isBusiness ? "Contactar" : "Postularme"}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* Estado Vacío Privado */
                <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5">
                    <Frown className="mx-auto text-zinc-700 mb-4" size={48} />
                    <h3 className="text-white font-bold text-xl">No hay coincidencias</h3>
                    <p className="text-zinc-500 mt-2">Prueba ajustando los filtros o tu ubicación.</p>
                </div>
            )}
        </div>
    );
};

export default InternalSearch;