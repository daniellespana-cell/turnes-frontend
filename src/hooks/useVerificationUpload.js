import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { VerificationService } from '../services/verificationService';
import { ALLOWED_MIME_TYPES, COMPANY_DOC_TYPES, WORKER_DOC_TYPES } from '../config/verification.constants';

export const useVerificationUpload = (user, onSuccess) => {
    const activeDocTypes = user?.role === 'empresa' ? COMPANY_DOC_TYPES : WORKER_DOC_TYPES;

    const [docs, setDocs] = useState(() => {
        const initial = {};
        activeDocTypes.forEach(dt => initial[dt.id] = null);
        return initial;
    });
    
    const [uploadProgress, setUploadProgress] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [legalAccepted, setLegalAccepted] = useState(false);

    const handleFileSelect = useCallback((docType, file) => {
        if (!file) return;

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setError(`Formato no permitido: ${file.type}. Solo JPG, PNG, WEBP o PDF.`);
            return;
        }

        if (docType === 'selfie' && file.type === 'application/pdf') {
            setError(`La selfie debe ser una imagen (JPG, PNG o WEBP), no un PDF.`);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError(`El archivo ${file.name} supera el límite de 10MB.`);
            return;
        }

        setError(null);
        setDocs(prev => ({ ...prev, [docType]: file }));
    }, []);

    const handleDrop = useCallback((e, docType) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(docType, file);
    }, [handleFileSelect]);

    const handleRemoveFile = useCallback((e, docType) => {
        e.stopPropagation();
        setDocs(prev => ({ ...prev, [docType]: null }));
        setError(null);
    }, []);

    const allDocsSelected = activeDocTypes.every(dt => docs[dt.id] !== null);
    const canSubmit = allDocsSelected && legalAccepted;

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const initialProgress = {};
            activeDocTypes.forEach(dt => initialProgress[dt.id] = 'uploading');
            setUploadProgress(initialProgress);

            const uploadPromises = activeDocTypes.map(docType => 
                VerificationService.uploadDocument(docs[docType.id], user.id, docType.id)
            );

            const results = await Promise.allSettled(uploadPromises);

            const failedUploads = results.filter(r => r.status === 'rejected');
            const successfulUploads = results.filter(r => r.status === 'fulfilled').map(r => r.value);

            if (failedUploads.length > 0) {
                if (successfulUploads.length > 0) {
                    const pathsToDelete = successfulUploads.map(doc => doc.path);
                    try {
                        await supabase.storage.from('verification-docs').remove(pathsToDelete);
                    } catch (rollbackError) {
                        console.error('Error durante el rollback de Storage:', rollbackError);
                    }
                }
                throw new Error('Hubo un problema de red al subir los archivos. Operación cancelada.');
            }

            const doneProgress = {};
            activeDocTypes.forEach(dt => doneProgress[dt.id] = 'done');
            setUploadProgress(doneProgress);

            const { error: rpcError } = await VerificationService.requestVerification(successfulUploads);
            if (rpcError) throw rpcError;

            onSuccess?.();
        } catch (err) {
            console.error('[useVerificationUpload] Error:', err);
            setError(err.message || 'Error al enviar la documentación. Intenta de nuevo.');
            setUploadProgress({});
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
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
    };
};
