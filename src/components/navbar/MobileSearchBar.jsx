import { Search, MapPin, Briefcase } from "lucide-react";

const MobileSearchBar = ({
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
  selectCity,
}) => {

  // Capturamos el Enter para mejorar la UX móvil (teclado 'Go' o 'Search')
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mt-4 px-1"> {/* Minimal wrapper */}

      {/* SINGLE ROW CAPSULE (Exact Match to Desktop) */}
      <div className="flex items-center bg-zinc-900/80 border border-zinc-700/50 rounded-full p-1 shadow-md">

        {/* BUSCAR TRABAJO */}
        <div className="flex-1 px-2 relative flex items-center min-w-0">
          <Search size={14} className="text-zinc-500 mr-2 shrink-0" />
          <input
            className="w-full bg-transparent text-white text-[13px] outline-none placeholder:text-zinc-600 h-9"
            placeholder="¿Qué buscas?"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* DIVIDER */}
        <div className="w-px h-4 bg-zinc-700/50 shrink-0 mx-1"></div>

        {/* BUSCAR CIUDAD */}
        <div className="w-24 px-2 flex items-center relative shrink-0">
          <MapPin size={13} className="text-zinc-500 mr-1.5 shrink-0" />
          <input
            className="w-full bg-transparent text-white text-[13px] outline-none placeholder:text-zinc-600 h-9"
            placeholder="Ciudad"
            value={locationTerm}
            onChange={(e) => handleLocationChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* BOTÓN BUSCAR (Icon Only) */}
        <button
          onClick={handleSearch}
          className="p-2 rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0 ml-1"
        >
          <Search size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* DROPDOWNS (Adapted for Mobile Width) */}
      <div className="relative mt-2">
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-0 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
            {suggestions.map((job, i) => (
              <div key={i} onClick={() => selectJob(job)} className="px-4 py-3 text-zinc-300 text-sm border-b border-zinc-800 last:border-0 active:bg-zinc-800 flex items-center gap-3">
                <Briefcase size={14} className="text-zinc-500" />
                {job}
              </div>
            ))}
          </div>
        )}

        {showCitySuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-50 top-0 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
            {citySuggestions.map((city, i) => (
              <div key={i} onClick={() => selectCity(city)} className="px-4 py-3 text-zinc-300 text-sm border-b border-zinc-800 last:border-0 active:bg-zinc-800 flex items-center gap-3">
                <MapPin size={14} className="text-zinc-500" />
                {city}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearchBar;