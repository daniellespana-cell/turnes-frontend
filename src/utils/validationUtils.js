/**
 * 🛡️ Validation Utilities (Single Source of Truth)
 * 
 * Lógica pura, sin dependencias de UI ni Base de Datos.
 * Centraliza las políticas de seguridad de la plataforma.
 */

/**
 * Valida la fortaleza de una contraseña basándose en políticas estrictas.
 * @param {string} password 
 * @returns {object} { isValid: boolean, error: string | null }
 */
export const validatePasswordStrength = (password) => {
    if (!password) {
        return { isValid: false, error: "La contraseña es obligatoria." };
    }

    if (password.length < 8) {
        return { isValid: false, error: "La contraseña debe tener al menos 8 caracteres." };
    }

    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: "La contraseña debe incluir al menos una letra mayúscula." };
    }

    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: "La contraseña debe incluir al menos una letra minúscula." };
    }

    if (!/[0-9]/.test(password)) {
        return { isValid: false, error: "La contraseña debe incluir al menos un número." };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
        return { isValid: false, error: "La contraseña debe incluir al menos un carácter especial (ej: @, *, #)." };
    }

    return { isValid: true, error: null };
};

/**
 * Normaliza y valida un número de teléfono móvil para Colombia.
 * Reglas de negocio (E.164):
 * 1. Exactamente 10 dígitos numéricos.
 * 2. Debe iniciar con '3' (prefijo móvil en Colombia: 300, 310, 320, etc.).
 * 3. Descarta automáticamente prefijos como '+57' o '57'.
 *
 * @param {string} rawPhone
 * @returns {{ isValid: boolean, digits: string, formatted: string, error: string | null }}
 */
export const validateColombianPhone = (rawPhone) => {
    if (!rawPhone || typeof rawPhone !== 'string') {
        return { isValid: false, digits: '', formatted: '', error: 'El número de teléfono es obligatorio.' };
    }

    // Extraer solo dígitos numéricos
    let digits = rawPhone.replace(/\D/g, '');

    // Descartar prefijo 57 si fue incluido
    if (digits.startsWith('57') && digits.length > 10) {
        digits = digits.slice(2);
    }

    if (digits.length === 0) {
        return { isValid: false, digits: '', formatted: '', error: 'Ingresa tu número de WhatsApp.' };
    }

    if (!digits.startsWith('3')) {
        return { isValid: false, digits, formatted: digits, error: 'El número móvil debe iniciar por 3 (Ej: 300 123 4567).' };
    }

    if (digits.length !== 10) {
        return { isValid: false, digits, formatted: digits, error: `El número debe tener exactamente 10 dígitos (tienes ${digits.length}).` };
    }

    // Formatear: 3XX XXX XXXX
    const formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;

    return { isValid: true, digits, formatted, error: null };
};

/**
 * Formatea dinámicamente un número de teléfono mientras el usuario escribe en el input.
 *
 * @param {string} input
 * @returns {string} Formato 3XX XXX XXXX
 */
export const formatPhoneInput = (input) => {
    if (!input) return '';
    let digits = input.replace(/\D/g, '');
    
    if (digits.startsWith('57') && digits.length > 10) {
        digits = digits.slice(2);
    }
    
    digits = digits.slice(0, 10); // Límite estricto de 10 dígitos

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};

