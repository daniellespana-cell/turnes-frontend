import { useState, useEffect } from 'react';
import { getRoleLabel } from '../domain/vacantes.taxonomy';

// Reusing MOCK_SHIFTS or defining new mock data tailored for applications
const MOCK_APPLICATIONS = [
    {
        id: 1,
        type: 'ocasional',
        status: 'pending', // Postulado (esperando confirmación)
        dateDisplay: 'HOY',
        fullDate: 'Mié, 28 Ene',
        time: '6:00 PM - 11:00 PM',
        price: 50000,
        role: getRoleLabel('MESERO'),
        company: 'Restaurante La Brasa',
        companyLogo: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=100&q=80',
        address: 'Cra 33 #45-12, Cabecera',
        city: 'Bucaramanga',
        category: 'Gastronomía'
    },
    {
        id: 2,
        type: 'fijo',
        status: 'confirmed', // Ya aceptado (Programado) - User wanted this logic moved here
        dateDisplay: 'MAÑANA',
        fullDate: 'Jue, 29 Ene',
        time: '8:00 AM - 5:00 PM',
        price: 45000,
        role: getRoleLabel('BODEGUERO'), // "Auxiliar de Bodega"
        company: 'Logística Santander',
        companyLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=100&q=80',
        address: 'Zona Franca, Bodega 4',
        city: 'Floridablanca',
        category: 'Logística'
    }
];

export const useWorkerApplications = () => {
    // Tab logic might be useful here: "Pendientes" vs "Confirmados"
    const [activeTab, setActiveTab] = useState('activas');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const filtered = MOCK_APPLICATIONS; // For now, show all valid future stuff
            setApplications(filtered);
            setLoading(false);
        }, 800);
    }, [activeTab]);

    return { activeTab, setActiveTab, applications, loading };
};
