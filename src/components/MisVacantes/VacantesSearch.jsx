import React from 'react';
import { Search } from 'lucide-react';


const VacantesSearch = ({ query, setQuery }) => {
  return (
    <div className="relative group w-full md:w-64">
      <Search
        className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors duration-300"
        size={14}
      />

      <input
        id="vacantes-search-input"
        name="vacantesSearch"
        type="text"
        aria-label="Buscar vacantes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
        className="
          w-full bg-transparent
          border-b border-white/10 group-focus-within:border-white/40
          py-2 pl-6 pr-0
          text-[11px] text-zinc-300 font-medium font-manrope tracking-widest uppercase
          outline-none transition-all duration-300
          placeholder:text-zinc-700 placeholder:font-bold
        "
      />
    </div>
  );
};

export default VacantesSearch;
