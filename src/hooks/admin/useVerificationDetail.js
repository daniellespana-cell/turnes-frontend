import { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import { VerificationService } from '../../services/verificationService';
import { useToast } from '../../context/ToastContext';

/**
 * 🔍 useVerificationDetail — Hook de lógica del detalle de verificación KYC
 * Extrae estado, fetching, URLs firmadas, approve/reject y estados de acción.
 */
export const useVerificationDetail = (id) => {
    const { showToast } = useToast();
    const [request, setRequest] = useState(null);
    const [signedUrls, setSignedUrls] = useState({});

    // Core Status
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [actionDone, setActionDone] = useState(null);

    // Reject Form State
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data, error } = await AdminService.getVerificationDetail(id);
                if (error) {
                    showToast('Fallo Crítico: No se pudo verificar la entidad en red.', 'error');
                    return;
                }

                setRequest(data);

                // Generar URLs firmadas seguras
                if (data?.documents?.length > 0) {
                    const urls = {};
                    for (const doc of data.documents) {
                        try {
                            urls[doc.path] = await VerificationService.getSignedUrl(doc.path);
                        } catch {
                            console.error('Fallo en la firma de URL segura:', doc.path);
                        }
                    }
                    setSignedUrls(urls);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, showToast]);

    const handleApprove = async () => {
        if (actionLoading) return;
        setActionLoading('approve');
        showToast('Firmando criptográficamente la aprobación...', 'info');

        try {
            const { error } = await VerificationService.approve(id);
            if (error) throw error;

            showToast('Entidad Verificada exitosamente.', 'success');
            setActionDone('approved');
        } catch (err) {
            showToast('System Fault: ' + (err.message || 'Error desconocido'), 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim() || actionLoading) return;
        setActionLoading('reject');
        showToast('Emitiendo notificación de rechazo...', 'info');

        try {
            const { error } = await VerificationService.reject(id, rejectionReason);
            if (error) throw error;

            showToast('La solicitud fue rechazada. Fondos reembolsados (audit).', 'success');
            setActionDone('rejected');
        } catch (err) {
            showToast('System Fault: ' + (err.message || 'Error desconocido'), 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const userName = request?.perfiles?.empresas?.nombre_comercial || request?.perfiles?.nombre_display || 'Anónimo';

    return {
        request,
        signedUrls,
        loading,
        actionLoading,
        actionDone,
        rejectionReason, setRejectionReason,
        showRejectForm, setShowRejectForm,
        handleApprove,
        handleReject,
        userName
    };
};
