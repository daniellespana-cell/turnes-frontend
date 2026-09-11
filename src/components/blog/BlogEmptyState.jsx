import React from 'react';

const BlogEmptyState = ({ onReset }) => {
  return (
    <div className="text-center py-16 bg-[#090b0e] rounded-3xl border border-zinc-800">
      <p className="text-zinc-400 text-base">No encontramos artículos que coincidan con tu búsqueda.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 text-sm text-emerald-400 font-bold hover:underline"
      >
        Limpiar filtros
      </button>
    </div>
  );
};

export default BlogEmptyState;
