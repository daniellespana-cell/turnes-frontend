import React from 'react';

/**
 * 🦴 Skeleton Component
 * Usado para prevenir el LCP Blocking mostrando cajas de carga.
 * @param {string} className - Clases de Tailwind (altura, ancho, borde)
 */
const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-zinc-800/50 rounded-xl ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
