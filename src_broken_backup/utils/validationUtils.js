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
