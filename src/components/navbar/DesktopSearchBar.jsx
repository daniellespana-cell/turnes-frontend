import { Search, MapPin, Briefcase } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


const DesktopSearchBar = ({
    wrapperRef,
    searchTerm,
    locationTerm,
    suggestions,
    citySuggestions,
    showSuggestions,
    showCitySuggestions,
    handleSearch,
    handleSearchChange,
    handleLocationChange,
    selectJob,
    selectCity
}) => {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="w-full md:flex-1 max-w-lg relative z-40" ref={wrapperRef}>

            <div
                className="flex items-center bg-zinc-800/40 border border-zinc-700/50 rounded-full p-0.5 shadow-sm hover:bg-zinc-800/60 transition-all focus-within:ring-1 focus-within:ring-brand-primary/40 focus-within:border-brand-primary/40 overflow-hidden"
                onKeyDown={handleKeyDown}
            >

                {/* BUSCAR TRABAJO */}
                <div className="flex-1 px-2 relative flex items-center min-w-0">
                    <Search size={13} className="text-zinc-500 mr-1.5 shrink-0" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Trabajo..."
                        className="w-full bg-transparent text-white placeholder-zinc-600 text-[12px] outline-none h-8"
                        autoComplete="off"
                    />
                </div>

                <div className="w-px h-3 bg-zinc-700/50 shrink-0"></div>

                {/* BUSCAR CIUDAD */}
                <div className="w-20 px-2 flex items-center relative shrink-0">
                    <MapPin size={12} className="text-zinc-500 mr-1 shrink-0" />
                    <input
                        type="text"
                        value={locationTerm}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        placeholder="Ciudad"
                        className="w-full bg-transparent text-white placeholder-zinc-600 text-[12px] outline-none h-8"
                        autoComplete="off"
                    />
                </div>

                {/* BOTÓN BUSCAR */}
                <button
                    type="button"
                    onClick={handleSearch}
                    className="group p-1.5 transition-all active:scale-95 flex items-center justify-center mr-0 shrink-0"
                >
                    <Search size={16} strokeWidth={3} className="text-purple-500 group-hover:text-emerald-500 transition-colors" />
                </button>
            </div>

            {/* --- DROPDOWNS --- */}
            <AnimatePresence>
                {/* 1. SUGERENCIAS DE EMPLEOS */}
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-1.5 w-60 bg-zinc-800 border border-zinc-700 rounded-xl  z-[60] overflow-hidden"
                    >
                        <ul className="py-1">
                            {suggestions.map((job, index) => (
                                <li key={index} onClick={() => selectJob(job)}
                                    className="px-3 py-2 hover:bg-zinc-700 cursor-pointer text-zinc-300 text-[13px] flex items-center gap-2"
                                >
                                    <Briefcase size={12} className="text-zinc-500" /> {job}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* 2. SUGERENCIAS DE CIUDADES (LO QUE FALTABA) */}
                {showCitySuggestions && citySuggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full right-10 mt-1.5 w-56 bg-zinc-800 border border-zinc-700 rounded-xl  z-[60] overflow-hidden"
                    >
                        <ul className="py-1">
                            {citySuggestions.map((city, index) => (
                                <li key={index} onClick={() => selectCity(city)}
                                    className="px-3 py-2 hover:bg-zinc-700 cursor-pointer text-zinc-300 text-[13px] flex items-center gap-2"
                                >
                                    <MapPin size={12} className="text-zinc-500" /> {city}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DesktopSearchBar;