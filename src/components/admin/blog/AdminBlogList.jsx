import React, { useState } from 'react';
import { Plus, Search, ExternalLink, Edit2, Trash2, BookOpen, Star } from 'lucide-react';
import Spinner from '../../ui/Spinner';

export const AdminBlogList = ({ posts = [], loading, onNewPost, onEditPost, onDeletePost }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = posts.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="text-emerald-400" size={24} /> Blog y Centro de Noticias
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Crea y administra artículos, guías y comunicados para empresas y colaboradores.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewPost}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus size={16} /> Nuevo Artículo
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por título o enlace..."
          className="w-full bg-zinc-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" variant="emerald" />
          <p className="text-xs text-zinc-500">Cargando catálogo de artículos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-950/40 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No hay artículos registrados</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {searchTerm ? 'No encontramos coincidencias con tu búsqueda.' : 'Crea tu primera publicación con el botón superior.'}
            </p>
          </div>
          {!searchTerm && (
            <button
              type="button"
              onClick={onNewPost}
              className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Crear Artículo Ahora
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/5 bg-zinc-950/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-zinc-900/40 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="py-4 px-5">Artículo</th>
                  <th className="py-4 px-4">Categoría</th>
                  <th className="py-4 px-4">Estado</th>
                  <th className="py-4 px-4">Fecha</th>
                  <th className="py-4 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filtered.map((post) => (
                  <tr key={post.id || post.slug} className="hover:bg-white/[0.02] transition-colors">
                    {/* Artículo Info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        {post.coverUrl ? (
                          <img
                            src={post.coverUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10 bg-zinc-900"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-zinc-500">
                            <BookOpen size={16} />
                          </div>
                        )}
                        <div className="min-w-0 max-w-sm">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            {post.title}
                            {post.featured && (
                              <span title="Destacado">
                                <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-mono truncate">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-4 px-4 text-zinc-300">
                      <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/5 text-[11px] font-semibold text-zinc-400">
                        {post.categoryName || post.category}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-white/5">
                          Borrador
                        </span>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-4 text-zinc-500 text-[11px]">
                      {post.publishDate || 'Reciente'}
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          title="Ver en vivo en la web"
                        >
                          <ExternalLink size={15} />
                        </a>

                        <button
                          type="button"
                          onClick={() => onEditPost(post)}
                          className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors"
                          title="Editar artículo"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeletePost(post.id)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Eliminar artículo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
