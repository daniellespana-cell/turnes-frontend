import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const useWorkerDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Simulación de Datos (En producción vendría de una API)
    const mockData = useMemo(() => ({
        profileCompleteness: 70, // % de completitud
        activeShift: null, // null o objeto turno
        // Ejemplo de turno activo para probar:
        // activeShift: {
        //   id: 't-123',
        //   role: 'Mesero',
        //   business: 'Restaurante El Cielo',
        //   time: '2:00 PM',
        //   address: 'Cl 93 # 11-30',
        //   earnings: 60000
        // },
        weeklyEarnings: 150000,
        weeklyGoal: 500000,
        recommendedVacancies: [
            { id: 1, title: 'Auxiliar de Cocina', price: 55000, business: 'Wok', distance: '1.2 km', tags: ['Rápido', 'Parrilla'] },
            { id: 2, title: 'Bartender', price: 70000, business: 'BBC', distance: '2.5 km', tags: ['Noche', 'Pro'] },
            { id: 3, title: 'Mesero Protocolo', price: 90000, business: 'Andrés DC', distance: '3.0 km', tags: ['Inglés', 'VIP'] },
        ]
    }), []);

    const dashboardData = useMemo(() => {
        if (!user) return null;

        // 1. Lógica Smart Onboarding
        const showOnboarding = mockData.profileCompleteness < 80;

        // 2. Priority Block Logic
        let priorityAction = null;
        if (mockData.activeShift) {
            priorityAction = {
                type: 'SHIFT_TODAY',
                data: mockData.activeShift,
                title: `Turno en ${mockData.activeShift.business}`,
                subtitle: `${mockData.activeShift.time} • ${mockData.activeShift.role}`,
                actionLabel: 'Ver Ticket de Entrada'
            };
        } else {
            priorityAction = {
                type: 'RECOMMENDATIONS',
                data: mockData.recommendedVacancies,
                title: 'Vacantes para ti hoy',
                subtitle: 'Basado en tus habilidades de Gastronomía',
                actionLabel: 'Explorar Todo'
            };
        }

        return {
            user: user,
            profileProgress: mockData.profileCompleteness,
            showOnboarding,
            priorityAction,
            gamification: {
                current: mockData.weeklyEarnings,
                goal: mockData.weeklyGoal,
                percentage: Math.round((mockData.weeklyEarnings / mockData.weeklyGoal) * 100)
            }
        };
    }, [user, mockData]);

    useEffect(() => {
        // Simular carga de red
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return {
        ...dashboardData,
        loading
    };
};
