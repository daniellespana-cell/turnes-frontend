import React from 'react';


/**
 * Footer de paginación reutilizable para tablas admin.
 * @param {Object} props
 * @param {number} props.page - Página actual (0-indexed)
 * @param {Function} props.setPage - Setter de página
 * @param {number} props.total - Total de registros mostrados
 * @param {number} props.limit - Límite por página
 * @param {string} [props.label] - Texto descriptivo
 */
const AdminPagination = ({ page, setPage, total, limit, label }) => (
    <div className="bg-zinc-900/40 p-3 border-t border-white/5 flex items-center justify-between px-6">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {label || `${total} registros cargados`}
        </span>
        <div className="flex gap-2">
            <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                aria-label="Página anterior"
                className="px-3 py-1 bg-black/40 border border-white/5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                type="button">
                Anterior
            </button>
            <button
                disabled={total < limit}
                onClick={() => setPage(p => p + 1)}
                aria-label="Página siguiente"
                className="px-3 py-1 bg-black/40 border border-white/5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                type="button">
                Siguiente
            </button>
        </div>
    </div>
);

export default AdminPagination;
