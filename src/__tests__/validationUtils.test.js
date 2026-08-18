import { describe, it, expect } from 'vitest';
import { validateColombianPhone, formatPhoneInput, validatePasswordStrength } from '../utils/validationUtils';

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
});
