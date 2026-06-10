import { useState, useEffect } from 'react';
import { AdminService } from '../../services/adminService';
import { VerificationService } from '../../services/verificationService';

/**
 * 📊 useAdminDashboard — Hook de lógica del panel de control admin
 * Extrae estado, fetching de métricas y cola de pendientes.
 */
export const useAdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [pendingQueue, setPendingQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                let startDate = null;
                let endDate = null;
                const now = new Date();

                if (dateFilter === 'today') {
                    startDate = new Date(now.setHours(0,0,0,0)).toISOString();
                    endDate = new Date(now.setHours(23,59,59,999)).toISOString();
                } else if (dateFilter === 'week') {
                    const lastWeek = new Date(now);
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    startDate = lastWeek.toISOString();
                    endDate = new Date().toISOString();
                } else if (dateFilter === 'month') {
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = firstDay.toISOString();
                    endDate = new Date().toISOString();
                }

                const [metricsRes, queueRes] = await Promise.all([
                    AdminService.getMetrics(startDate, endDate),
                    VerificationService.getQueue('pending', 5, 0)
                ]);

                if (metricsRes.data) setMetrics(metricsRes.data);
                if (queueRes.data) setPendingQueue(queueRes.data);
            } catch (err) {
                console.error('[AdminDashboard] Critical Boot Error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [dateFilter]);

    return {
        metrics,
        pendingQueue,
        loading,
        dateFilter, setDateFilter
    };
};
