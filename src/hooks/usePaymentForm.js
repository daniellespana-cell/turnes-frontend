import { useState, useEffect, useRef } from 'react';

// Helpers puros
const formatCardNumber = (value) => {
    const regex = /^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})$/g;
    const onlyNumbers = value.replace(/[^\d]/g, '');
    return onlyNumbers.replace(regex, (regex, $1, $2, $3, $4) =>
        [$1, $2, $3, $4].filter((group) => !!group).join(' ')
    );
};

const detectCardType = (number) => {
    const clean = number.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'visa';
    if (/^5[1-5]/.test(clean)) return 'mastercard';
    return 'unknown';
};

export const usePaymentForm = (onSuccess) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        name: '',
        expiry: '',
        cvc: ''
    });
    const [cardType, setCardType] = useState('unknown');
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [shake, setShake] = useState(false);

    // Referencia para evitar memory leaks si el componente se desmonta
    const isMounted = useRef(true);

    useEffect(() => {
        setCardType(detectCardType(formData.cardNumber));
        return () => { isMounted.current = false; };
    }, [formData.cardNumber]);

    const handleChange = (field, value) => {
        let finalValue = value;

        // 1. LOGICA TARJETA
        if (field === 'cardNumber') {
            finalValue = formatCardNumber(value);
        }

        // 2. LOGICA NOMBRE
        if (field === 'name') {
            finalValue = value.toUpperCase();
        }

        // 3. LOGICA FECHA (CORREGIDA - EVITA TRAMPA DEL BACKSPACE)
        if (field === 'expiry') {
            // Solo permitir números y barra
            if (!/^[0-9/]*$/.test(value)) return;

            // Máximo 5 caracteres (MM/YY)
            if (value.length > 5) return;

            // Auto-agregar slash SOLO si el usuario está escribiendo (longitud aumenta)
            // Y si acaba de escribir el segundo dígito del mes.
            if (value.length === 2 && formData.expiry.length === 1) {
                finalValue = value + '/';
            } else {
                finalValue = value;
            }
        }

        // 4. LOGICA CVC (SOLO NUMEROS)
        if (field === 'cvc') {
            // Solo números y máximo 4 dígitos
            const onlyNums = value.replace(/[^\d]/g, '');
            if (onlyNums.length > 4) return;
            finalValue = onlyNums;
        }

        setFormData(prev => ({ ...prev, [field]: finalValue }));

        // Limpiar error al escribir
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validaciones
        if (formData.cardNumber.replace(/\s/g, '').length < 15) newErrors.cardNumber = true;
        if (formData.name.trim().length < 3) newErrors.name = true;

        // Validación estricta de fecha (longitud y mes válido)
        const [month, year] = formData.expiry.split('/');
        if (formData.expiry.length !== 5 || !month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
            newErrors.expiry = true;
        }

        if (formData.cvc.length < 3) newErrors.cvc = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            triggerShake();
            return;
        }

        setIsProcessing(true);

        // Mock API Call
        setTimeout(() => {
            if (isMounted.current) {
                setIsProcessing(false);
                onSuccess();
            }
        }, 2000);
    };

    return {
        formData,
        cardType,
        errors,
        isProcessing,
        shake,
        handleChange,
        handleSubmit
    };
};