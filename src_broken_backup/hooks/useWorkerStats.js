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
                // Ejecutar las 3 queries en paralelo para máxima velocidad
                const [shiftsRes, applicationsRes, reviewsRes] = await Promise.allSettled([
                    // 1. Turnos finalizados (Sincronizado con Esquema V2)
                    supabase
                        .from('postulaciones')
                        .select('id, created_at, vacante:vacantes!inner(salario, pago_monto)')
                        .eq('user_id', user.id)
                        .in('status', ['finalizado', 'contratado']),
                    
                    // 2. Postulaciones activas (pendientes / en proceso)
                    supabase
                        .from('postulaciones')
                        .select('id', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .in('status', ['pendiente', 'aceptado']),
                    
                    // 3. Rating promedio recibido
                    supabase
                        .from('reviews')
                        .select('rating')
                        .eq('reviewed_id', user.id)
                ]);

                // Turnos finalizados y ganancias (SSOT: Salario del trabajador post-curación)
                const shifts = shiftsRes.status === 'fulfilled' ? (shiftsRes.value.data || []) : [];
                const totalShifts = shifts.length;
                const totalEarned = shifts.reduce((acc, s) => {
                    // Tras la curación, el valor real estará en salario o pago_monto
                    const montoReal = Math.max(
                        Number(s.vacante?.salario || 0),
                        Number(s.vacante?.pago_monto || 0)
                    );
                    return acc + montoReal;
                }, 0);

                // Postulaciones activas
                const activeApplications = applicationsRes.status === 'fulfilled' 
                    ? (applicationsRes.value.count || 0) 
                    : 0;

                // Rating promedio
                const reviews = reviewsRes.status === 'fulfilled' ? (reviewsRes.value.data || []) : [];
                const avgRating = reviews.length > 0 
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : null;

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
                    totalShifts,
                    totalEarned,
                    activeApplications,
                    avgRating,
                    reviewCount: reviews.length,
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
    }, [isAuthenticated, user?.id]);

    return { stats: data, loading };
};
