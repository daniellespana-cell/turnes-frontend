import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { getAllSearchTags, CIUDADES_PRINCIPALES } from "../domain/vacantes.taxonomy";

// Usamos la Taxonomía Centralizada como fuente de verdad
const DATA = {
  JOBS: getAllSearchTags(), // Generado dinámicamente desde la taxonomía
  CITIES: CIUDADES_PRINCIPALES // Lista centralizada de ciudades
};

export function useSearchBar(userRole = "CANDIDATE_ROLE") {
  const navigate = useNavigate();
  const { user } = useAuth();
  const wrapperRef = useRef(null);

  const [query, setQuery] = useState({ job: "", location: "" });
  const [suggestions, setSuggestions] = useState({ jobs: [], cities: [] });
  const [ui, setUi] = useState({ showJobs: false, showCities: false });

  const closeDropdowns = useCallback(() => {
    setUi({ showJobs: false, showCities: false });
  }, []);

  const handleJobChange = (value) => {
    setQuery(prev => ({ ...prev, job: value }));
    if (value.trim().length > 0) {
      const filtered = DATA.JOBS.filter(item => item.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(prev => ({ ...prev, jobs: filtered }));
      setUi({ showJobs: true, showCities: false });
    } else {
      setUi(prev => ({ ...prev, showJobs: false }));
    }
  };

  const handleLocationChange = (value) => {
    setQuery(prev => ({ ...prev, location: value }));
    if (value.trim().length > 0) {
      const filtered = DATA.CITIES.filter(item => item.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(prev => ({ ...prev, cities: filtered }));
      setUi({ showJobs: false, showCities: true });
    } else {
      setUi(prev => ({ ...prev, showCities: false }));
    }
  };

  const selectItem = (type, value) => {
    setQuery(prev => ({ ...prev, [type]: value }));
    closeDropdowns();
  };

  const onSearch = () => {
    const params = new URLSearchParams();
    if (query.job) params.append("q", query.job);
    if (query.location) params.append("loc", query.location);
    if (userRole) params.append("role", userRole);

    closeDropdowns();

    // --- LÓGICA DE REDIRECCIÓN CORREGIDA ---
    // Si el usuario está logueado -> va a /buscar (InternalSearch)
    // Si NO está logueado -> va a /search (SearchPage)
    const targetPath = user ? "/buscar" : "/search";

    navigate(`${targetPath}?${params.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeDropdowns]);

  const clearSearch = () => {
    setQuery({ job: "", location: "" });
    closeDropdowns();
  };

  return {
    wrapperRef,
    searchTerm: query.job,
    locationTerm: query.location,
    suggestions: suggestions.jobs,
    citySuggestions: suggestions.cities,
    showSuggestions: ui.showJobs,
    showCitySuggestions: ui.showCities,
    handleSearch: onSearch,
    handleSearchChange: handleJobChange,
    handleLocationChange,
    selectJob: (val) => selectItem("job", val),
    selectCity: (val) => selectItem("location", val),
    clearSearch
  };
}