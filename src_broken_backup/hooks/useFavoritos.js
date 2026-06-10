import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CandidateService } from '../services/candidateService';

/**
 * ⭐ USE FAVORITOS (SENIOR)
 * Gestión de candidatos favoritos y recomendados basada en DB.
 */
export const useFavoritos = () => {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const cargarFavoritos = useCallback(async () => {
    if (!user?.id) return;

    try {
      // 🔄 FETCH REAL (Eliminamos localStorage.getItem('turnes_validados'))
      const data = await CandidateService.getFavoritos(user.id);

      if (isMounted.current) {
        // Mapeo senior para el UI de FavoritosWidget
        const normalized = data.map(f => ({
          ...f,
          payment: 50000 // Presupuesto estimado/referencia (WIP)
        }));

        setFavoritos(normalized);
        setLoading(false);

        // Evento para sincronización reactiva si es necesario
        window.dispatchEvent(new CustomEvent('favoritos_updated', { detail: normalized }));
      }
    } catch (error) {
      console.error("Error en useFavoritos (Senior):", error);
      if (isMounted.current) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    isMounted.current = true;
    cargarFavoritos();

    // Sincronización proactiva: Escuchamos eventos de actualización de postulaciones
    const handleSync = () => cargarFavoritos();
    window.addEventListener('favoritos_sync', handleSync);

    return () => {
      isMounted.current = false;
      window.removeEventListener('favoritos_sync', handleSync);
    };
  }, [cargarFavoritos]);

  return { favoritos, loading, refrescar: cargarFavoritos };
};