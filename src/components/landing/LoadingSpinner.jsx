import React from 'react';
import Spinner from '../ui/Spinner';


/**
 * LoadingSpinner (Wrapper de compatibilidad)
 * Delega al sistema unificado de carga para eliminar duplicación.
 */
const LoadingSpinner = () => (
    <Spinner size="lg" variant="emerald" center text="Cargando..." />
);

export default LoadingSpinner;