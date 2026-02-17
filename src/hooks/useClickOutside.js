import { useEffect } from 'react';

/**
 * Hook para detectar clicks fuera de un elemento.
 * @param {React.RefObject} ref - Referencia al elemento a observar.
 * @param {Function} handler - Función a ejecutar cuando se hace click fuera.
 */
export const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            // Si no hay ref o el click fue dentro del elemento, no hacer nada
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};
