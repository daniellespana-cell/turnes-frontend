import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Shield } from 'lucide-react';
import Spinner from '../ui/Spinner';
import DocUploadZone from './DocUploadZone';
import LegalComplianceCheckbox from './LegalComplianceCheckbox';

import { useAuth } from '../../context/AuthContext';
import { useVerificationUpload } from '../../hooks/useVerificationUpload';

const VerificationDocUpload = ({ onSuccess }) => {
    const { user } = useAuth();

    const {
        activeDocTypes,
        docs,
        uploadProgress,
        isSubmitting,
        error,
        legalAccepted,
        setLegalAccepted,
        handleFileSelect,
        handleDrop,
        handleRemoveFile,
        handleSubmit,
        canSubmit
    } = useVerificationUpload(user, onSuccess);

    // Guardia de Hidratación Temprana
    if (!user || !user.role) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Spinner size="md" variant="blue" />
                <p className="text-zinc-500 text-sm font-bold animate-pulse">Sincronizando perfil...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-lg mx-auto"
        >
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
                    <Shield size={32} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Documentación Requerida</h2>
                <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Sube los documentos para que nuestro equipo revise y active tu verificación en 24–48h.
                </p>
            </div>
            {/* Document Upload Zones */}
            <div className="space-y-4">
                {activeDocTypes.map(docType => (
                    <DocUploadZone
                        key={docType.id}
                        docType={docType}
                        file={docs[docType.id]}
                        progress={uploadProgress[docType.id]}
                        onFileSelect={handleFileSelect}
                        onRemoveFile={handleRemoveFile}
                        onDrop={handleDrop}
                        disabled={isSubmitting}
                    />
                ))}
            </div>
            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
                    >
                        <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Info Box */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">¿Qué pasa ahora?</p>
                <ul className="space-y-1">
                    {[
                        'El equipo de Turnes revisará tus documentos de identidad',
                        'Recibirás una notificación con el resultado en 24–48h',
                        'Si no se aprueba, recibirás un reembolso automático a tu cuenta'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                            <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            {/* Legal Compliance */}
            <LegalComplianceCheckbox 
                legalAccepted={legalAccepted} 
                setLegalAccepted={setLegalAccepted} 
            />
            {/* CTA */}
            <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all
                    ${canSubmit && !isSubmitting
                        ? 'bg-blue-500 text-white hover:bg-blue-400 active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                        : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    }`}
                type="button"
                aria-label="Acción">
                {isSubmitting ? (
                    <><Spinner size="sm" variant="white" /> Enviando documentos...</>
                ) : (
                    <><Shield size={16} /> Enviar Solicitud Segura</>
                )}
            </button>
        </motion.div>
    );
};

export default VerificationDocUpload;
