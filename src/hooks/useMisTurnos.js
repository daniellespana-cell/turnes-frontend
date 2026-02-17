import { useState, useEffect } from 'react';
import { getRoleLabel } from '../domain/vacantes.taxonomy';

const MOCK_SHIFTS = [
    {
        id: 1,
        type: 'ocasional',
        status: 'confirmed',
        dateDisplay: 'HOY',
        fullDate: 'Mié, 28 Ene',
        time: '6:00 PM - 11:00 PM',
        price: 50000,
        role: getRoleLabel('MESERO'), // "Mesero / Camarero" from Taxonomy
        company: 'Restaurante La Brasa',
        companyLogo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=100&q=80',
        address: 'Cra 33 #45-12, Cabecera',
        city: 'Bucaramanga',
        category: 'Gastronomía'
    },
    {
        id: 2,
        type: 'fijo',
        status: 'confirmed',
        dateDisplay: 'MAÑANA',
        fullDate: 'Jue, 29 Ene',
        time: '8:00 AM - 5:00 PM',
        price: 45000, // Valor por día
        role: getRoleLabel('BODEGUERO'), // "Auxiliar de Bodega" from Taxonomy
        company: 'Logística Santander',
        companyLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=100&q=80',
        address: 'Zona Franca, Bodega 4',
        city: 'Floridablanca',
        category: 'Logística'
    },
    {
        id: 3,
        type: 'ocasional',
        status: 'completed',
        dateDisplay: 'AYER',
        fullDate: 'Mar, 27 Ene',
        time: '2:00 PM - 6:00 PM',
        price: 35000,
        role: getRoleLabel('ANIMADOR'), // "Animador / Recreacionista" from Taxonomy
        company: 'Marketing Express',
        // companyLogo: undefined, // Testing fallback
        address: 'Parque Caracolí',
        city: 'Floridablanca',
        category: 'Marketing'
    }
];

export const useMisTurnos = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            // Solo Historial (Completed/Cancelled)
            const history = MOCK_SHIFTS.filter(s =>
                ['completed', 'cancelled'].includes(s.status)
            );
            setShifts(history);
            setLoading(false);
        }, 800);
    }, []);

    const deleteShift = (id) => {
        // Optimistic update
        setShifts(prev => prev.filter(s => s.id !== id));
        // Here you would call API
        console.log(`Deleted shift ${id}`);
    };

    return { shifts, loading, deleteShift };
};