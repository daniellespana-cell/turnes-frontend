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

/**
 * Valida montos de dinero en Pesos Colombianos (COP).
 * Evita números negativos, ceros, valores no numéricos o fuera de límites.
 *
 * @param {number|string} amount - Monto en pesos
 * @param {number} min - Monto mínimo permitido (default: $50.000 COP)
 * @param {number} max - Monto máximo permitido (default: $20.000.000 COP)
 * @returns {{ isValid: boolean, cleanAmount: number, error: string | null }}
 */
export const validateMoneyAmount = (amount, min = 50000, max = 20000000) => {
    if (amount === null || amount === undefined || amount === '') {
        return { isValid: false, cleanAmount: 0, error: 'El monto es obligatorio.' };
    }

    const num = typeof amount === 'number' 
        ? amount 
        : parseInt(String(amount).replace(/\D/g, ''), 10);

    if (isNaN(num) || num <= 0) {
        return { isValid: false, cleanAmount: 0, error: 'Ingresa un monto válido mayor a $0.' };
    }

    if (num < min) {
        const formattedMin = new Intl.NumberFormat('es-CO').format(min);
        return { isValid: false, cleanAmount: num, error: `El monto mínimo es de $${formattedMin} COP.` };
    }

    if (num > max) {
        const formattedMax = new Intl.NumberFormat('es-CO').format(max);
        return { isValid: false, cleanAmount: num, error: `El monto máximo permitido es de $${formattedMax} COP.` };
    }

    return { isValid: true, cleanAmount: num, error: null };
};

/**
 * Valida de forma exhaustiva el payload completo del formulario de creación de vacantes.
 * 
 * @param {object} formData
 * @param {boolean} hasSensitiveData
 * @returns {{ isValid: boolean, errors: Record<string, string>, firstError: string | null }}
 */
export const validateVacancyPayload = (formData, hasSensitiveData = false) => {
    const errors = {};

    // 1. Tags / Cargos
    if (!formData?.tags || !Array.isArray(formData.tags) || formData.tags.length === 0) {
        errors.tags = 'Debes seleccionar al menos un cargo o rol.';
    } else if (formData.tags.length > 2) {
        errors.tags = 'Máximo puedes seleccionar 2 cargos por turno.';
    }

    // 2. Ubicación
    if (!formData?.location || typeof formData.location !== 'string' || !formData.location.trim()) {
        errors.location = 'La ciudad o municipio es obligatoria.';
    }

    // 3. Pago (Mínimo legal en Turnes: $50.000 COP)
    const moneyCheck = validateMoneyAmount(formData?.payment, 50000, 20000000);
    if (!moneyCheck.isValid) {
        errors.payment = moneyCheck.error || 'El pago mínimo por turno es de $50.000 COP.';
    }

    // 4. Fecha del Turno
    if (!formData?.date) {
        errors.date = 'La fecha del turno es obligatoria.';
    } else {
        const localHoy = new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd
        if (formData.date < localHoy) {
            errors.date = 'La fecha del turno no puede ser en el pasado.';
        }
    }

    // 5. Horario
    if (!formData?.schedule) {
        errors.schedule = 'Selecciona un horario para el turno.';
    }

    // 6. Cantidad de vacantes
    const qty = parseInt(formData?.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 50) {
        errors.quantity = 'La cantidad de personas debe ser entre 1 y 50.';
    }

    // 7. Descripción y DLP (Data Loss Prevention)
    const desc = formData?.description?.trim() || '';
    if (desc.length < 10) {
        errors.description = 'La descripción debe tener al menos 10 caracteres.';
    } else if (desc.length > 150) {
        errors.description = 'La descripción no puede superar los 150 caracteres.';
    } else if (hasSensitiveData) {
        errors.description = 'Por seguridad, no incluyas teléfonos, correos ni datos de contacto.';
    }

    const firstError = Object.values(errors)[0] || null;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        firstError
    };
};

/**
 * Valida y normaliza una dirección de correo electrónico según estándar RFC 5322.
 * Limpia espacios y convierte a minúsculas automáticamente.
 *
 * @param {string} rawEmail
 * @returns {{ isValid: boolean, cleanEmail: string, error: string | null }}
 */
export const validateEmail = (rawEmail) => {
    if (!rawEmail || typeof rawEmail !== 'string') {
        return { isValid: false, cleanEmail: '', error: 'El correo electrónico es obligatorio.' };
    }

    const cleanEmail = rawEmail.trim().toLowerCase();

    if (cleanEmail.length === 0) {
        return { isValid: false, cleanEmail: '', error: 'El correo electrónico es obligatorio.' };
    }

    // RegEx RFC 5322 simplificado de grado producción
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(cleanEmail)) {
        return { isValid: false, cleanEmail, error: 'Ingresa un formato de correo electrónico válido (ej. usuario@dominio.com).' };
    }

    return { isValid: true, cleanEmail, error: null };
};

/**
 * Valida el formulario de registro de usuarios (Candidato / Empresa).
 *
 * @param {object} payload - { fullName, email, password, confirmPassword, role }
 * @returns {{ isValid: boolean, errors: Record<string, string>, firstError: string | null }}
 */
export const validateRegistrationPayload = (payload) => {
    const errors = {};

    // 1. Nombre / Razón Social
    const name = payload?.fullName?.trim() || '';
    if (name.length < 3) {
        errors.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    // 2. Email
    const emailCheck = validateEmail(payload?.email);
    if (!emailCheck.isValid) {
        errors.email = emailCheck.error || 'Correo electrónico inválido.';
    }

    // 3. Contraseñas
    const password = payload?.password || '';
    const confirmPassword = payload?.confirmPassword || '';

    if (password !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
        errors.password = passwordCheck.error || 'La contraseña no cumple con los requisitos de seguridad.';
    }

    const firstError = Object.values(errors)[0] || null;

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        firstError
    };
};

/**
 * Valida montos de recarga para la billetera empresarial con pasarela Wompi.
 *
 * @param {number|string} amount - Monto en pesos COP
 * @param {number} min - Mínimo de recarga (default: $15.000 COP)
 * @param {number} max - Máximo de recarga (default: $10.000.000 COP)
 * @returns {{ isValid: boolean, cleanAmount: number, amountInCents: number, error: string | null }}
 */
export const validateRechargeAmount = (amount, min = 15000, max = 10000000) => {
    const moneyCheck = validateMoneyAmount(amount, min, max);
    if (!moneyCheck.isValid) {
        return {
            isValid: false,
            cleanAmount: moneyCheck.cleanAmount,
            amountInCents: 0,
            error: moneyCheck.error
        };
    }

    return {
        isValid: true,
        cleanAmount: moneyCheck.cleanAmount,
        amountInCents: Math.round(moneyCheck.cleanAmount * 100),
        error: null
    };
};


