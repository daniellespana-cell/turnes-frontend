import { useState, useCallback, useEffect } from 'react';
import { CIUDADES_COORDS } from '../../domain/geography.config';

export const INITIAL_VACANCY_STATE = {
    tags: [],
    location: "",
    lat: null,
    lng: null,
    description: "",
    schedule: "",
    date: "",
    payment: 50000,
    type: "temporal",
    quantity: 1,
    isUrgent: false,
    isLocationConfirmed: false, // 🎯 Nueva bandera de maestría
};

/**
 * useVacancyForm (Micro-Hook K.I.S.S)
 * Responsabilidad Única: Manejar el estado del formulario de creación y derivar latitud/longitud.
 */
export const useVacancyForm = (prefillData = null) => {
    const [formData, setFormData] = useState(() => {
        if (prefillData && typeof prefillData === 'object') {
            return {
                ...INITIAL_VACANCY_STATE,
                ...prefillData,
            };
        }
        return INITIAL_VACANCY_STATE;
    });

    // Reaccionar a cambios en prefillData (ej: relanzar turno / duplicar)
    useEffect(() => {
        if (prefillData && typeof prefillData === 'object') {
            setFormData(prev => ({
                ...prev,
                ...prefillData,
            }));
        }
    }, [prefillData]);

    // --- AUTO-DETECT LAT/LNG ---
    // Solo actúa si la ubicación no ha sido confirmada quirúrgicamente en el mapa
    useEffect(() => {
        if (!formData.isLocationConfirmed && formData.location) {
            // Reconciliación Case-Insensitive (ej: "valledupar" -> "Valledupar")
            const searchName = formData.location.trim().toLowerCase();
            const cityKey = Object.keys(CIUDADES_COORDS).find(k => k.toLowerCase() === searchName);

            if (cityKey && CIUDADES_COORDS[cityKey]) {
                const { lat, lng } = CIUDADES_COORDS[cityKey];
                setFormData(prev => {
                    if (prev.lat === lat && prev.lng === lng) return prev;
                    return { ...prev, lat, lng };
                });
            }
        }
    }, [formData.location, formData.isLocationConfirmed]);

    // --- HANDLERS ---
    const handleLocationConfirm = useCallback((lat, lng, address) => {
        setFormData(prev => ({
            ...prev,
            lat,
            lng,
            location: address || prev.location,
            isLocationConfirmed: true
        }));
    }, []);

    const resetLocationConfirmation = useCallback(() => {
        setFormData(prev => ({ ...prev, isLocationConfirmed: false }));
    }, []);

    const handleModalidadChange = useCallback((type) => {
        setFormData(prev => ({ ...prev, type }));
    }, []);

    const handleImpulsoChange = useCallback((isUrgent) => {
        setFormData(prev => ({ ...prev, isUrgent }));
    }, []);

    const handleQuantityChange = useCallback((offset) => {
        setFormData(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) + offset) }));
    }, []);

    const handlePaymentChange = useCallback((e) => {
        const numValue = parseInt(e.target.value.replace(/\D/g, "")) || 0;
        setFormData(prev => ({ ...prev, payment: numValue }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(INITIAL_VACANCY_STATE);
    }, []);

    return {
        formData,
        setFormData,
        handlers: {
            handleModalidadChange,
            handleImpulsoChange,
            handleQuantityChange,
            handlePaymentChange,
            handleLocationConfirm,
            resetLocationConfirmation,
            resetForm
        }
    };
};
