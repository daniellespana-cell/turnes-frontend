import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import Spinner from '../../ui/Spinner';

export const BlogImageUploader = ({ coverUrl, onUpload, uploading, onRemove }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Foto de Portada del Artículo
        </label>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <Sparkles size={11} /> Auto-compresión WebP activa
        </span>
      </div>

      {coverUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10 group aspect-[16/9] max-h-72 w-full bg-zinc-900">
          <img 
            src={coverUrl} 
            alt="Portada del artículo" 
            className="w-full h-full object-cover object-center" 
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Cambiar Foto
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
                title="Eliminar foto"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-emerald-500 bg-emerald-500/5' 
              : 'border-white/10 hover:border-white/20 bg-zinc-950/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Spinner size="md" variant="emerald" />
              <p className="text-xs text-zinc-400 font-medium">Comprimiendo y subiendo portada a WebP...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-3 text-zinc-400 border border-white/5">
                <Upload size={20} />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                Arrastra tu foto de portada aquí o haz clic para subir
              </p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Puedes subir fotos pesadas de Canva, celular o cámara. El sistema las recortará y optimizará automáticamente.
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
