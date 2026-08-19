import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

// Constante configurable — en el futuro puede venir del perfil del usuario o de remote config
const MONTHLY_GOAL = 500_000;

/**
 * useWorkerStats — Obtiene KPIs reales del postulante desde Supabase.
 * Zero-Trust: Todas las queries filtran por user.id autenticado.
 */
export const useWorkerStats = () => {
    const { user, isAuthenticated } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        const fetchStats = async () => {
            try {
                // 🚀 SENIOR APPROACH: Single Atomic RPC Call (SSOT & CQRS)
                // Evitamos 3 queries en paralelo (N+1) y lecturas masivas.
                const { data, error } = await supabase.rpc('rpc_get_worker_dashboard_stats', {
                    p_user_id: user.id
                });

                if (error) throw error;

                // Días como miembro
                const createdAt = user.created_at || user.createdAt;
                const memberSince = createdAt ? new Date(createdAt) : new Date();
                const daysSinceJoin = Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24)));

                // Perfil completado
                const profileFields = [
                    user?.nombre_display && user.nombre_display !== 'Usuario Nuevo',
                    user?.avatar_url,
                    user?.bio,
                    user?.telefono,
                    user?.direccion,
                    user?.skills?.length > 0,
                ];
                const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

                setData({
                    totalShifts: data?.totalShifts || 0,
                    totalEarned: data?.totalEarned || 0,
                    activeApplications: data?.activeApplications || 0,
                    avgRating: data?.avgRating > 0 ? Number(data.avgRating).toFixed(1) : null,
                    reviewCount: 0, // Eliminado por optimización. Se mostrará si el perfil lo trae, o no se muestra.
                    daysSinceJoin,
                    profileCompletion,
                    monthlyGoal: MONTHLY_GOAL,
                });
            } catch (err) {
                console.error('[useWorkerStats] Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, user?.id, user?.nombre_display, user?.avatar_url, user?.bio, user?.telefono, user?.direccion, user?.skills?.length, user?.created_at, user?.createdAt]);

    return { stats: data, loading };
};
