import { describe, it, expect } from 'vitest';
import { 
    validateColombianPhone, 
    formatPhoneInput, 
    validatePasswordStrength,
    validateMoneyAmount,
    validateVacancyPayload 
} from '../utils/validationUtils';

describe('Validation Utilities (SSOT)', () => {
    describe('validateColombianPhone', () => {
        it('debe aceptar números móviles válidos de 10 dígitos que inicien en 3', () => {
            const result = validateColombianPhone('3101234567');
            expect(result.isValid).toBe(true);
            expect(result.digits).toBe('3101234567');
            expect(result.formatted).toBe('310 123 4567');
            expect(result.error).toBeNull();
        });

        it('debe normalizar y aceptar números con espacios y formato', () => {
            const result = validateColombianPhone('310 123 4567');
            expect(result.isValid).toBe(true);
            expect(result.digits).toBe('3101234567');
            expect(result.formatted).toBe('310 123 4567');
        });

        it('debe descartar prefijo internacional +57 o 57', () => {
            const result1 = validateColombianPhone('+57 320 987 6543');
            expect(result1.isValid).toBe(true);
            expect(result1.digits).toBe('3209876543');

            const result2 = validateColombianPhone('573001112233');
            expect(result2.isValid).toBe(true);
            expect(result2.digits).toBe('3001112233');
        });

        it('debe rechazar números que no inicien en 3', () => {
            const result = validateColombianPhone('6011234567');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('iniciar por 3');
        });

        it('debe rechazar números con longitud distinta a 10 dígitos', () => {
            const shortResult = validateColombianPhone('310123');
            expect(shortResult.isValid).toBe(false);
            expect(shortResult.error).toContain('10 dígitos');

            const longResult = validateColombianPhone('310123456789');
            expect(longResult.isValid).toBe(false);
            expect(longResult.error).toContain('10 dígitos');
        });

        it('debe manejar entradas vacías o nulas', () => {
            expect(validateColombianPhone('').isValid).toBe(false);
            expect(validateColombianPhone(null).isValid).toBe(false);
            expect(validateColombianPhone(undefined).isValid).toBe(false);
        });
    });

    describe('formatPhoneInput', () => {
        it('debe formatear a medida que el usuario escribe', () => {
            expect(formatPhoneInput('310')).toBe('310');
            expect(formatPhoneInput('3101')).toBe('310 1');
            expect(formatPhoneInput('310123')).toBe('310 123');
            expect(formatPhoneInput('3101234')).toBe('310 123 4');
            expect(formatPhoneInput('3101234567')).toBe('310 123 4567');
        });

        it('debe limitar a máximo 10 dígitos', () => {
            expect(formatPhoneInput('3101234567890')).toBe('310 123 4567');
        });

        it('debe limpiar caracteres no numéricos', () => {
            expect(formatPhoneInput('310-abc-123')).toBe('310 123');
        });
    });

    describe('validatePasswordStrength', () => {
        it('debe requerir mayúscula, minúscula, número y símbolo', () => {
            expect(validatePasswordStrength('Weak1!').isValid).toBe(false); // < 8 chars
            expect(validatePasswordStrength('alllowercase1!').isValid).toBe(false);
            expect(validatePasswordStrength('ALLUPPERCASE1!').isValid).toBe(false);
            expect(validatePasswordStrength('NoSpecialChar123').isValid).toBe(false);
            expect(validatePasswordStrength('ValidPassword123!').isValid).toBe(true);
        });
    });

    describe('validateMoneyAmount', () => {
        it('debe validar montos de dinero correctos', () => {
            const valid = validateMoneyAmount(70000);
            expect(valid.isValid).toBe(true);
            expect(valid.cleanAmount).toBe(70000);
            expect(valid.error).toBeNull();
        });

        it('debe rechazar montos por debajo del mínimo legal ($50.000 COP)', () => {
            const invalid = validateMoneyAmount(30000);
            expect(invalid.isValid).toBe(false);
            expect(invalid.error).toContain('mínimo es de $50.000 COP');
        });

        it('debe rechazar valores negativos, ceros o vacíos', () => {
            expect(validateMoneyAmount(0).isValid).toBe(false);
            expect(validateMoneyAmount(-50000).isValid).toBe(false);
            expect(validateMoneyAmount('').isValid).toBe(false);
        });
    });

    describe('validateVacancyPayload', () => {
        const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('en-CA');
        const validPayload = {
            tags: ['Barista'],
            location: 'Bogotá',
            payment: 75000,
            date: tomorrow,
            schedule: 'turno_completo',
            quantity: 2,
            description: 'Se busca barista experto para restaurante en zona norte.'
        };

        it('debe validar un payload de vacante completamente válido', () => {
            const result = validateVacancyPayload(validPayload);
            expect(result.isValid).toBe(true);
            expect(result.firstError).toBeNull();
        });

        it('debe rechazar fechas en el pasado', () => {
            const invalid = { ...validPayload, date: '2020-01-01' };
            const result = validateVacancyPayload(invalid);
            expect(result.isValid).toBe(false);
            expect(result.errors.date).toContain('pasado');
        });

        it('debe rechazar descripciones con datos sensibles (DLP)', () => {
            const result = validateVacancyPayload(validPayload, true);
            expect(result.isValid).toBe(false);
            expect(result.errors.description).toContain('teléfonos');
        });

        it('debe rechazar si faltan tags o ubicación', () => {
            const result1 = validateVacancyPayload({ ...validPayload, tags: [] });
            expect(result1.isValid).toBe(false);
            expect(result1.errors.tags).toBeDefined();

            const result2 = validateVacancyPayload({ ...validPayload, location: ' ' });
            expect(result2.isValid).toBe(false);
            expect(result2.errors.location).toBeDefined();
        });
    });
});
