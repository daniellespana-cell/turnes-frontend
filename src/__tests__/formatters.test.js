import { describe, it, expect } from 'vitest';
import { formatDateMY, getTurnoTypeLabel, formatCurrencyCOP } from '../utils/formatters';
import { UI_STRINGS } from '../domain/uiTranslations';

describe('utils/formatters.js', () => {
    
    describe('formatDateMY', () => {
        it('debe formatear correctamente una fecha en estilo corto (es-CO)', () => {
            const date = '2025-10-15T12:00:00Z';
            const result = formatDateMY(date);
            // El resultado puede variar ligeramente según el entorno de Intl (mayúsculas o puntos)
            // pero usualmente es "oct 2025" o "oct. 2025"
            expect(result.toLowerCase()).toContain('oct');
            expect(result).toContain('2025');
        });

        it('debe devolver el fallback de VACANCY.DATE_PENDING si la fecha es nula', () => {
            expect(formatDateMY(null)).toBe(UI_STRINGS.VACANCY.DATE_PENDING);
        });
    });

    describe('getTurnoTypeLabel', () => {
        it('debe devolver BUSINESS.TYPE_FIXED para "fijo"', () => {
            expect(getTurnoTypeLabel('fijo')).toBe(UI_STRINGS.BUSINESS.TYPE_FIXED);
        });

        it('debe devolver BUSINESS.TYPE_OCCASIONAL para "ocasional" o "suelto"', () => {
            expect(getTurnoTypeLabel('ocasional')).toBe(UI_STRINGS.BUSINESS.TYPE_OCCASIONAL);
            expect(getTurnoTypeLabel('suelto')).toBe(UI_STRINGS.BUSINESS.TYPE_OCCASIONAL);
        });

        it('debe devolver el fallback ocasional para tipos desconocidos', () => {
            expect(getTurnoTypeLabel('raro')).toBe(UI_STRINGS.BUSINESS.TYPE_OCCASIONAL);
        });
    });

    describe('formatCurrencyCOP', () => {
        it('debe formatear montos a moneda COP', () => {
            const result = formatCurrencyCOP(50000);
            // Dependiendo del entorno Intl, puede ser "$50.000", "$ 50.000", etc.
            expect(result).toContain('50');
            expect(result).toContain('$');
        });
    });
});
