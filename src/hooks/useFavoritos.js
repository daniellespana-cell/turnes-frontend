import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotifications } from './useNotifications'; // Import

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const { addNotification } = useNotifications(); // Access context

  const cargarFavoritos = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem('turnes_validados') || '[]');

      /**
       * FILTRO SENIOR:
       * Solo entran si tienen éxito previo y el corazón activo.
       */
      const validados = data.filter(c =>
        (c.isWinner || c.estadoTurno === 'EJECUTADO') && c.isFavorite === true
      );

      const favoritosConData = validados.map(f => ({
        ...f,
        payment: f.payment || 50000
      }));

      if (isMounted.current) {
        setFavoritos(favoritosConData);
        setLoading(false);

        /**
         * NUEVO: Disparamos un evento personalizado para avisar a otros hooks
         * que la data de favoritos ha cambiado (útil para el ChatPage).
         */
        window.dispatchEvent(new CustomEvent('favoritos_updated', { detail: favoritosConData }));
      }
    } catch (error) {
      console.error("Error en useFavoritos:", error);
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Ejecución inmediata más segura que requestAnimationFrame para evitar "flash" de carga
    cargarFavoritos();

    // Sincronización entre pestañas y eventos internos
    const syncStorage = (e) => {
      if (e.key === 'turnes_validados' || e.type === 'favoritos_sync') {
        cargarFavoritos();
      }
    };

    window.addEventListener('storage', syncStorage);
    window.addEventListener('favoritos_sync', syncStorage); // Evento interno

    return () => {
      isMounted.current = false;
      window.removeEventListener('storage', syncStorage);
      window.removeEventListener('favoritos_sync', syncStorage);
    };
  }, [cargarFavoritos]);

  return { favoritos, loading, refrescar: cargarFavoritos };
};