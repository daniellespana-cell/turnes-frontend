import { useState, useMemo, useEffect } from 'react';
import { VACANTES_TAXONOMY, getCategoriasList } from '../domain/vacantes.taxonomy';
import { useVacancyFilters } from './useVacancyFilters';
import { useAuth } from '../context/AuthContext';
import { VacancyService } from '../services/vacancyService';
import { GeoService } from '../services/geoService';
import { MatchService } from '../services/matchService';

export const useExploreVacancies = () => {
    const [activeCategory, setActiveCategory] = useState('TODOS');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
    const [loading, setLoading] = useState(true);
    const [vacancies, setVacancies] = useState([]);

    // --- INTEGRACIÓN FILTROS AVANZADOS ---
    const {
        filters, toggleFilter, clearFilters,
        isFilterOpen, setIsFilterOpen, activeFilterCount
    } = useVacancyFilters();

    // FILTROS DE CATEGORÍAS
    const categories = useMemo(() => {
        return [
            { id: 'TODOS', label: 'Todos' },
            ...getCategoriasList().map(c => ({ id: c.id, label: c.label.split(' ')[0] }))
        ];
    }, []);



    // --- GEOLOCALIZACIÓN Y FILTRADO POR RADIO (5KM) ---
    // TODO: En Fase 2 (GeoService), esto vendrá del dispositivo real
    const userLocation = { lat: 4.6097, lng: -74.0817 };

    // 🔄 DATA FETCHING (Service Layer Integration)
    useEffect(() => {
        let mounted = true;

        async function fetchVacancies() {
            setLoading(true);
            try {
                // 1. Llamada al Servicio (KISS: Trae todo, filtra en cliente por ahora)
                const { data, error } = await VacancyService.getFeed();

                if (error) throw error;

                if (mounted && data) {
                    // 2. Normalización (DB -> UI)
                    const normalized = data.map(v => ({
                        id: v.id,
                        title: v.titulo,
                        business: v.empresas?.nombre_comercial || 'Empresa Confidencial',
                        businessLogo: v.empresas?.logo_url,
                        isVerified: v.empresas?.verificado,
                        price: v.pago_monto,
                        type: v.tipo_turno || 'Temporal',
                        description: v.descripcion,
                        time: '8h', // TODO: Calcular real
                        date: new Date(v.fecha_turno).toLocaleDateString('es-CO', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
                        distance: 0, // Se calcula abajo
                        category: v.categoria,
                        image: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9f4?auto=format&fit=crop&w=800&q=80', // TODO: Imagen real
                        tags: v.tags || [],
                        rating: 4.8, // TODO: ReputationService
                        lat: v.latitud,
                        lng: v.longitud
                    }));
                    setVacancies(normalized);
                }
            } catch (err) {
                console.error("Error fetching vacancies:", err);
                // Fallback a array vacío (EmptyState)
                setVacancies([]);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchVacancies();

        return () => { mounted = false; };
    }, []); // Dependencias vacías: solo al montar (Feed Inicial)



    //  FILTRADO Y SCORING EN CLIENTE
    const filteredVacancies = useMemo(() => {
        // 1. Enriquecer con Datos Calculados (Distancia + Score)
        const enriched = vacancies.map(v => {
            const dist = GeoService.calculateDistance(userLocation.lat, userLocation.lng, v.lat, v.lng);

            // Mock Profile para MatchService
            const userProfile = {
                lat: userLocation.lat,
                lng: userLocation.lng,
                categories: [] // TODO: Phase 4 - Connect to Real User Profile
            };

            const score = MatchService.calculateScore(v, userProfile);

            return {
                ...v,
                realDistance: dist,
                distance: `${dist} km`,
                matchScore: score,
                isHighMatch: score >= 85
            };
        });

        // 2. Filtrado y Ordenamiento
        return enriched.filter(vacancy => {
            // Basic Filters
            const matchesCategory = activeCategory === 'TODOS' || vacancy.category === activeCategory;
            const matchesSearch = vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vacancy.business.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDistance = vacancy.realDistance <= 15.0;
            const matchesType = filters.types.length === 0 || filters.types.includes(vacancy.type);

            return matchesCategory && matchesSearch && matchesDistance && matchesType;
        }).sort((a, b) => b.matchScore - a.matchScore); // Ordenar por Inteligencia (Mayor Score primero)

    }, [activeCategory, searchQuery, vacancies, filters, userLocation.lat, userLocation.lng]);

    // --- AUTH INTEGRATION ---
    const { user, isAuthenticated } = useAuth();
    // (Opcional) Toast para feedback visual si no logueado
    // const { showToast } = useToast(); 

    // ACTION: Postularse (REAL)
    const applyToVacancy = async (vacancyId) => {
        if (!isAuthenticated || !user?.id) {
            console.warn("User not authenticated. Redirecting to login...");
            // TODO: Redirigir a /login o mostrar Modal
            return { success: false, message: "Debes iniciar sesión para postularte." };
        }

        try {
            const { data, error } = await VacancyService.apply(vacancyId, user.id);

            if (error) throw error;
            return { success: true, message: "Postulación exitosa." };
        } catch (err) {
            console.error("Error applying:", err);
            // Manejo de error de duplicado (Unique Constraint)
            if (err.code === '23505') {
                return { success: false, message: "Ya te has postulado a esta vacante." };
            }
            return { success: false, message: "Error al postularse." };
        }
    };

    return {
        vacancies: filteredVacancies,
        categories,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        applyToVacancy,
        loading,
        viewMode,
        setViewMode,
        userLocation,
        filters, toggleFilter, clearFilters, isFilterOpen, setIsFilterOpen, activeFilterCount
    };
};
