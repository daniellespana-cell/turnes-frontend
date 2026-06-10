import React from 'react';
import { Upload, CheckCircle, X } from 'lucide-react';

import { useState, useRef } from 'react';

const DocUploadZone = ({ docType, file, progress, onFileSelect, onRemoveFile, onDrop, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const isDone = progress === 'done';
    const isUploading = progress === 'uploading';

    return (
        <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { setIsDragging(false); onDrop(e, docType.id); }}
            onClick={() => !disabled && !file && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300
                ${isDone ? 'border-emerald-500/40 bg-emerald-500/5' :
                  isDragging ? 'border-blue-400/60 bg-blue-500/10' :
                  file ? 'border-zinc-600 bg-zinc-900/50' :
                  'border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900/30 cursor-pointer'}
                ${disabled ? 'pointer-events-none opacity-60' : ''}
            `}
        >
            <input
                ref={inputRef}
                type="file"
                accept={docType.accept}
                className="hidden"
                onChange={e => onFileSelect(docType.id, e.target.files[0])}
            />

            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                    ${isDone ? 'bg-emerald-500/10' : 'bg-zinc-900'}`}>
                    {isDone ? <CheckCircle size={24} className="text-emerald-400" /> : docType.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{docType.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{docType.subtitle}</p>
                    
                    {file && (
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-blue-400 font-medium truncate">
                                {isUploading ? 'Subiendo...' : isDone ? '✓ Subido exitosamente' : `📎 ${file.name}`}
                            </p>
                            {!isUploading && !isDone && (
                                <button
                                    onClick={(e) => onRemoveFile(e, docType.id)}
                                    className="p-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400/80 hover:text-red-400 transition-colors z-10 focus:outline-none"
                                    title="Remover documento"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                    )}

                    {!file && (
                        <p className="text-[10px] text-zinc-600 mt-1">
                            JPG, PNG, PDF · Máx 10MB
                        </p>
                    )}
                </div>

                {!file && (
                    <Upload size={16} className="text-zinc-600 shrink-0" />
                )}
                {file && !isDone && !isUploading && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Listo para enviar" />
                )}
            </div>
        </div>
    );
};

export default DocUploadZone;
