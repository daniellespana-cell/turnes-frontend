import React from 'react';
import { Plus, Trash2, Lightbulb, MessageSquare } from 'lucide-react';

export const BlogSectionEditor = ({
  sections = [],
  onAddSection,
  onUpdateSectionTitle,
  onUpdateParagraph,
  onAddParagraph,
  onRemoveParagraph,
  onToggleCallout,
  onUpdateCallout,
  onRemoveSection
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Secciones y Contenido del Artículo
          </h3>
          <p className="text-xs text-zinc-500">
            Organiza el artículo en subtítulos y párrafos. Todo se renderiza de forma limpia y segura.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddSection}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
        >
          <Plus size={14} /> Nueva Sección
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section, sIdx) => (
          <div 
            key={section.id || sIdx}
            className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-4 transition-all hover:border-white/10"
          >
            {/* Header de la Sección */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-xs font-bold text-zinc-400">
                  {sIdx + 1}
                </span>
                <input
                  type="text"
                  value={section.title || ''}
                  onChange={(e) => onUpdateSectionTitle(sIdx, e.target.value)}
                  placeholder="Subtítulo de la sección (ej. Los 3 pasos indispensables)..."
                  className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveSection(sIdx)}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Eliminar esta sección"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Lista de Párrafos */}
            <div className="space-y-3 pl-8">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                Párrafos de texto
              </label>

              {(section.paragraphs || ['']).map((paragraph, pIdx) => (
                <div key={pIdx} className="flex items-start gap-2">
                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(e) => onUpdateParagraph(sIdx, pIdx, e.target.value)}
                    placeholder={`Escribe el párrafo ${pIdx + 1}...`}
                    className="flex-1 bg-zinc-900/30 border border-white/5 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-700 leading-relaxed focus:outline-none focus:border-emerald-500/30 resize-y"
                  />
                  {section.paragraphs?.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveParagraph(sIdx, pIdx)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-2"
                      title="Eliminar párrafo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onAddParagraph(sIdx)}
                  className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  <Plus size={13} /> Agregar otro párrafo
                </button>

                <span className="text-zinc-700">•</span>

                <button
                  type="button"
                  onClick={() => onToggleCallout(sIdx)}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                    section.callout 
                      ? 'text-amber-400' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Lightbulb size={13} />
                  {section.callout ? 'Quitar recuadro de consejo' : 'Agregar recuadro de consejo destacado'}
                </button>
              </div>

              {/* Recuadro de Consejo / Alerta Opcional */}
              {section.callout && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2 mt-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={section.callout.badge || ''}
                      onChange={(e) => onUpdateCallout(sIdx, 'badge', e.target.value)}
                      placeholder="Etiqueta (ej. Consejo Pro Turnes)..."
                      className="bg-zinc-900 border border-amber-500/20 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400 placeholder-amber-700 focus:outline-none"
                    />
                    <span className="text-[10px] text-amber-400/60 uppercase font-black tracking-widest">
                      Recuadro Destacado
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={section.callout.text || ''}
                    onChange={(e) => onUpdateCallout(sIdx, 'text', e.target.value)}
                    placeholder="Escribe el texto de la recomendación o alerta aquí..."
                    className="w-full bg-transparent border-0 text-xs text-amber-200/90 placeholder-amber-700 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddSection}
        className="w-full py-3.5 rounded-2xl border border-dashed border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-zinc-400 hover:text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={16} /> Agregar Nueva Sección
      </button>
    </div>
  );
};
