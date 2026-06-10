import React from 'react';

/**
 * Estado vacío genérico para tablas y listas de admin.
 * @param {Object} props
 * @param {React.ElementType} props.icon - Componente de icono Lucide
 * @param {string} props.message - Texto descriptivo
 */
const AdminEmptyState = ({ icon: Icon, message }) => (
    <div className="p-16 text-center text-zinc-500">
        <Icon size={32} className="mx-auto mb-3 opacity-30" />
        <p className="font-bold text-sm">{message}</p>
    </div>
);

export default AdminEmptyState;
