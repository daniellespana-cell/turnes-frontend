import { useEffect } from 'react';

/**
 * useFocusTrap
 * @param {boolean} isActive - Si el modal está abierto
 * @param {React.MutableRefObject} containerRef - Referencia al contenedor del modal
 * @param {React.MutableRefObject} initialFocusRef - Elemento a enfocar inicialmente (ej: botón cerrar)
 * @param {Function} onClose - Callback al presionar Escape
 */
export const useFocusTrap = (isActive, containerRef, initialFocusRef, onClose) => {
    useEffect(() => {
        if (!isActive) return;

        // Enfocar el elemento inicial
        if (initialFocusRef?.current) {
            initialFocusRef.current.focus();
        }

        const handleKey = (e) => {
            if (e.key === 'Escape') {
                if (onClose) onClose();
                return;
            }

            if (e.key !== 'Tab' || !containerRef?.current) return;

            const focusableElements = containerRef.current.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKey);
        
        // Prevenir scroll en el background mientras el modal esté abierto
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = originalOverflow;
        };
    }, [isActive, containerRef, initialFocusRef, onClose]);
};
