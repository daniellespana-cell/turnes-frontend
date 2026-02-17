import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Frown } from 'lucide-react';

// --- IMPORTACIONES DE COMPONENTES ---
// Asegúrate de tener estos archivos en sus carpetas correspondientes
import ResultCard from '../components/search/ResultCard';

// --- IMPORTACIÓN DE DATOS ---
import { MOCK_RESULTS } from '../data/mockData';

const SearchPage = () => {
    const [searchParams] = useSearchParams();

    // 1. Obtener parámetros de búsqueda de la URL
    const query = searchParams.get('q') || '';
    const location = searchParams.get('loc') || '';

    // 2. Lógica de Filtrado (usando los datos mockeados)
    const filteredResults = useMemo(() => {
        return MOCK_RESULTS.filter(item => {
            // Filtro por texto (título o etiquetas)
            const matchQuery = query
                ? item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                : true;

            // Filtro por ubicación
            const matchLocation = location
                ? item.location.toLowerCase().includes(location.toLowerCase())
                : true;

            return matchQuery && matchLocation;
        });
    }, [query, location]);

    return (
        <div className="min-h-screen bg-zinc-950 font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
            {/* Navbar is handled by MainLayout */}

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-zinc-200">

                {/* Static Background (No animation) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-emerald-900/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

                <div className="max-w-5xl mx-auto relative z-10">

                    {/* Cabecera de Resultados (Clean & Static) */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {filteredResults.length} Resultados
                            </h1>
                            <p className="text-zinc-500 text-sm">
                                {query ? <span>Búsqueda: <strong className="text-white">"{query}"</strong></span> : <span>Explorando todas las vacantes</span>}
                                {location && <span> en <strong className="text-white">"{location}"</strong></span>}
                            </p>
                        </div>

                        {/* Botón visual de Filtros (Minimalist) */}
                        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-zinc-300 font-medium transition-colors text-xs uppercase tracking-wide">
                            <Filter size={14} />
                            Filtros
                        </button>
                    </div>

                    {/* Lista de Resultados */}
                    {filteredResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3"> {/* Tight grid */}
                            {filteredResults.map(item => (
                                <ResultCard key={item.id} data={item} />
                            ))}
                        </div>
                    ) : (
                        // Estado Vacío (Minimalist Static)
                        <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-800">
                                <Frown size={24} className="text-zinc-600" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-1">Sin resultados</h3>
                            <p className="text-zinc-500 max-w-sm mx-auto mb-5 text-sm">
                                No encontramos coincidencias. Intenta términos más simples.
                            </p>
                            <button
                                onClick={() => window.location.href = '/buscar'}
                                className="text-emerald-500 hover:text-emerald-400 font-semibold text-sm transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer is handled by MainLayout */}
        </div>
    );
};

export default SearchPage;