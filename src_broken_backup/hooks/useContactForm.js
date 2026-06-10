import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { UI_STRINGS } from '../domain/uiTranslations';
import { contactService } from '../services/contactService';

/**
 * Hook personalizado para manejar la lógica del formulario de contacto.
 * Separa la UI de la lógica de negocio y estado.
 */
export const useContactForm = () => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        honeypot: '', // Campo anti-spam (debe estar vacío)
        acceptedTerms: false // Checkbox legal
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    // Manejo de inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    // Envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Anti-Spam (Honeypot) - Si tiene valor, es un bot.
        if (formData.honeypot) {
            console.warn("Spam attempt detected and blocked.");
            setStatus('success'); // Fake success para engañar al bot
            setFormData({ name: '', email: '', message: '', honeypot: '', acceptedTerms: false });
            return;
        }

        // 2. Validación Legal
        if (!formData.acceptedTerms) {
            showToast(UI_STRINGS.VALIDATION.PRIVACY_REQUIRED, "warning");
            return;
        }

        // Validación básica
        if (!formData.name || !formData.email || !formData.message) return;

        setStatus('loading');

        // Enviamos los datos reales, incluyendo el consentimiento legal
        const { honeypot, ...dataToSend } = formData;

        const result = await contactService.sendMessage(dataToSend);

        if (result.success) {
            setStatus('success');
            setFormData({ name: '', email: '', message: '', honeypot: '', acceptedTerms: false });
        } else {
            console.error("Contact Form Error:", result.error);
            setStatus('error');
        }
    };

    // Resetear estado (para enviar otro mensaje)
    const resetForm = () => {
        setStatus('idle');
        setFormData(prev => ({ ...prev, name: '', email: '', message: '', honeypot: '', acceptedTerms: false }));
    };

    return {
        formData,
        status,
        handleChange,
        handleSubmit,
        resetForm
    };
};
