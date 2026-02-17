import { useMemo } from 'react';

export const useWorkerFinance = () => {
    // MOCK DATA: Simulación de Finanzas
    // En producción, esto vendría de API /worker/wallet
    const financeData = useMemo(() => ({
        balance: {
            total: 1250000,
            available: 450000,
            pending: 800000
        },
        monthlyMetrics: [
            { month: 'Ene', value: 1200000 },
            { month: 'Feb', value: 950000 },
            { month: 'Mar', value: 1400000 },
            { month: 'Abr', value: 1100000 },
            { month: 'May', value: 1800000 },
            { month: 'Jun', value: 1250000 }, // Current
        ],
        history: [
            { id: 'tx-01', business: 'Restaurante El Cielo', date: 'Hoy, 2:30 PM', amount: 60000, status: 'pending', type: 'payment' },
            { id: 'tx-02', business: 'Andrés DC', date: 'Ayer, 8:00 PM', amount: 90000, status: 'completed', type: 'payment' },
            { id: 'tx-03', business: 'Retiro Bancolombia', date: '25 Jun', amount: -200000, status: 'completed', type: 'withdrawal' },
            { id: 'tx-04', business: 'BBC Cervecería', date: '24 Jun', amount: 75000, status: 'completed', type: 'payment' },
        ]
    }), []);

    // Calcular totales o derivadas si es necesario
    const stats = useMemo(() => {
        return {
            bestMonth: 'Mayo ($1.8M)',
            avgIncome: '$1.2M',
            totalShifts: 14
        };
    }, []);

    return {
        ...financeData,
        stats
    };
};
