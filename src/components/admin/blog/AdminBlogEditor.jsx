import React from 'react';
import { ArrowLeft, Save, Globe, Eye, Sparkles } from 'lucide-react';
import { BlogImageUploader } from './BlogImageUploader';
import { BlogSectionEditor } from './BlogSectionEditor';
import { BLOG_CATEGORIES_CONFIG } from '../../../domain/blog.mapper';
import Spinner from '../../ui/Spinner';

export const AdminBlogEditor = ({
  post,
  saving,
  uploading,
  onUpdateField,
  onCoverUpload,
  onAddSection,
  onUpdateSectionTitle,
  onUpdateParagraph,
  onAddParagraph,
  onRemoveParagraph,
  onToggleCallout,
  onUpdateCallout,
  onRemoveSection,
  onSave,
  onCancel
}) => {
  if (!post) return null;

  const isEditingExisting = Boolean(post.id);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Volver a la Lista
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Spinner size="sm" variant="black" /> Guardando...
              </>
            ) : (
              <>
                <Save size={15} /> {isEditingExisting ? 'Guardar Cambios' : 'Publicar Artículo'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Metadata Card */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/5 space-y-6">
        {/* Título y Slug */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Título del Artículo *
          </label>
          <input
            type="text"
            value={post.title || ''}
            onChange={(e) => onUpdateField('title', e.target.value)}
            placeholder="Ej: Cómo calcular las tarifas de un turno extra de bartender..."
            className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl px-4 py-3 text-lg font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
          {post.slug && (
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 pl-1">
              <Globe size={13} className="text-emerald-500/60" />
              <span>Enlace público:</span>
              <span className="text-zinc-400 font-mono">turnes.co/blog/{post.slug}</span>
            </p>
          )}
        </div>

        {/* Categoría y Estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Categoría Editorial *
            </label>
            <select
              value={post.category || 'empresas'}
              onChange={(e) => onUpdateField('category', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/50"
            >
              {BLOG_CATEGORIES_CONFIG.filter(c => c.id !== 'todos').map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Estado de Publicación
            </label>
            <select
              value={post.status || 'published'}
              onChange={(e) => onUpdateField('status', e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="published">🟢 Publicado (Visible en turnes.co/blog)</option>
              <option value="draft">⚪ Borrador (Solo visible en admin)</option>
              <option value="archived">🔴 Archivado (Oculto)</option>
            </select>
          </div>

          <div className="flex items-end pb-1.5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(post.featured)}
                onChange={(e) => onUpdateField('featured', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/50 border-white/20 bg-zinc-900"
              />
              <span className="text-xs font-semibold text-zinc-300">
                ⭐ Destacar como artículo principal
              </span>
            </label>
          </div>
        </div>

        {/* Foto de Portada con auto-compresión */}
        <BlogImageUploader
          coverUrl={post.coverUrl}
          onUpload={onCoverUpload}
          uploading={uploading}
          onRemove={() => onUpdateField('coverUrl', null)}
        />

        {/* Resumen para Google / Redes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Resumen para Google y Redes Sociales *
            </label>
            <span className="text-[11px] text-zinc-500">
              {(post.excerpt || '').length}/250 caracteres
            </span>
          </div>
          <textarea
            rows={3}
            value={post.excerpt || ''}
            onChange={(e) => onUpdateField('excerpt', e.target.value)}
            placeholder="Escribe una breve introducción atractiva de 2 a 3 líneas que saldrá en WhatsApp y en las búsquedas de Google..."
            className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-3.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Constructor de Secciones */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/5">
        <BlogSectionEditor
          sections={post.sections}
          onAddSection={onAddSection}
          onUpdateSectionTitle={onUpdateSectionTitle}
          onUpdateParagraph={onUpdateParagraph}
          onAddParagraph={onAddParagraph}
          onRemoveParagraph={onRemoveParagraph}
          onToggleCallout={onToggleCallout}
          onUpdateCallout={onUpdateCallout}
          onRemoveSection={onRemoveSection}
        />
      </div>

      {/* Floating Action Button */}
      <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          {post.sections?.length || 0} secciones • Estado: <strong className="text-white uppercase">{post.status}</strong>
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Descartar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : (isEditingExisting ? 'Guardar Cambios' : 'Publicar Ahora')}
          </button>
        </div>
      </div>
    </div>
  );
};
