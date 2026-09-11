import React from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { PATHS } from '../../../config/routes.paths';

const BlogTemplateSelector = ({ templates, selectedTemplateTab, onSelectTab, copiedTemplateId, onCopyTemplate }) => {
  if (!templates || templates.length === 0) return null;

  const currentTemplate = templates.find(t => t.id === selectedTemplateTab) || templates[0];

  return (
    <div className="space-y-5 pt-3">
      <div className="flex flex-wrap gap-2.5">
        {templates.map(tpl => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelectTab(tpl.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedTemplateTab === tpl.id
                ? 'bg-[#047857] text-white border border-emerald-600/40 shadow-sm'
                : 'bg-[#090b0e] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {tpl.role}
          </button>
        ))}
      </div>

      {currentTemplate && (
        <div className="bg-[#090b0e] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{currentTemplate.role}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400 mt-1.5">
                <span><strong>Horario típico:</strong> {currentTemplate.typicalHours}</span>
                <span>•</span>
                <span><strong>Tarifa sugerida:</strong> <span className="text-emerald-400 font-bold">{currentTemplate.suggestedRate}</span></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCopyTemplate(currentTemplate.id, currentTemplate.descriptionText)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#121720] hover:bg-zinc-800 border border-zinc-700 text-sm font-bold text-white transition-all shrink-0"
            >
              {copiedTemplateId === currentTemplate.id ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span className="text-emerald-400">¡Plantilla Copiada!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copiar Plantilla</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-5 sm:p-6 rounded-2xl bg-[#040507] border border-zinc-800 text-sm sm:text-base text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto select-all">
            {currentTemplate.descriptionText}
          </pre>

          <div className="text-xs sm:text-sm text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span>💡 Recuerda reemplazar [Nombre del Negocio / Zona] con tus datos reales antes de publicar.</span>
            <Link to={PATHS.PUBLIC.REGISTER_COMPANY} className="text-emerald-400 hover:underline font-bold">
              Publicar con esta plantilla &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogTemplateSelector;
