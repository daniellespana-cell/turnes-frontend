import React from 'react';
// MOCK para evitar errores de compilación
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48 py-12">
    <div className="animate-spin h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full" />
  </div>
);
export default LoadingSpinner;