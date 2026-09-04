import { describe, it, expect } from 'vitest';
import { normalizeVacancy, normalizeApplication, isPastDate, isShiftExpired } from '../domain/vacancy.mapper';
import { resolveNotificationText } from '../domain/notificationTranslations';
import { UI_STRINGS } from '../domain/uiTranslations';

describe('vacancy.mapper.js', () => {
    const T = UI_STRINGS.VACANCY;

    describe('normalizeVacancy', () => {
        it('debe usar T.UNTITLED si no hay título', () => {
            const raw = { id: 1 };
            const normalized = normalizeVacancy(raw, new Map());
            expect(normalized.title).toBe(T.UNTITLED);
        });

        it('debe usar T.CONFIDENTIAL_COMPANY si no hay empresa', () => {
            const raw = { id: 1, titulo: 'Dev' };
            const normalized = normalizeVacancy(raw, new Map());
            expect(normalized.business).toBe(T.CONFIDENTIAL_COMPANY);
        });

        it('debe formatear el precio correctamente (label)', () => {
            const raw = { id: 1, pago_monto: 50000 };
            const normalized = normalizeVacancy(raw, new Map());
            expect(normalized.priceLabel).toBe('$50k');
        });

        it('debe usar T.TO_BE_NEGOTIATED si el precio es 0', () => {
            const raw = { id: 1, pago_monto: 0 };
            const normalized = normalizeVacancy(raw, new Map());
            expect(normalized.priceLabel).toBe(T.TO_BE_NEGOTIATED);
        });

        it('debe usar T.PROTECTED_LOCATION si no hay dirección', () => {
            const raw = { id: 1 };
            const normalized = normalizeVacancy(raw, new Map());
            expect(normalized.address).toBe(T.PROTECTED_LOCATION);
        });
    });

    describe('isPastDate & isShiftExpired (Opción 2)', () => {
        it('debe identificar fechas pasadas correctamente', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toLocaleDateString('en-CA');

            expect(isPastDate(yesterdayStr)).toBe(true);
        });

        it('no debe considerar pasada la fecha de hoy', () => {
            const today = new Date();
            const todayStr = today.toLocaleDateString('en-CA');

            expect(isPastDate(todayStr)).toBe(false);
        });

        it('no debe considerar pasada una fecha futura', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 2);
            const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

            expect(isPastDate(tomorrowStr)).toBe(false);
        });

        it('debe manejar fechas inválidas o nulas sin lanzar error', () => {
            expect(isPastDate(null)).toBe(false);
            expect(isPastDate(undefined)).toBe(false);
            expect(isPastDate('')).toBe(false);
            expect(isPastDate('invalid-date')).toBe(false);
        });

        it('debe expirar turno si fecha ya pasó y tiene 0 postulantes (Opción 2)', () => {
            const pastDate = '2020-01-01';
            expect(isShiftExpired(pastDate, 0)).toBe(true);
        });

        it('NO debe expirar turno automáticamente si tiene postulantes aunque la fecha haya pasado', () => {
            const pastDate = '2020-01-01';
            expect(isShiftExpired(pastDate, 1)).toBe(false);
            expect(isShiftExpired(pastDate, 5)).toBe(false);
        });

        it('NO debe expirar turno si la fecha es hoy o futura, incluso con 0 postulantes', () => {
            const future = new Date();
            future.setDate(future.getDate() + 5);
            const futureStr = future.toISOString().split('T')[0];

            expect(isShiftExpired(futureStr, 0)).toBe(false);
        });
    });

    describe('normalizeApplication', () => {
        it('debe usar T.TODAY si la fecha es hoy', () => {
            const today = new Date().toISOString();
            const raw = { id: 1, vacante: { fecha_turno: today } };
            const normalized = normalizeApplication(raw);
            expect(normalized.dateDisplay).toBe(T.TODAY);
        });

        it('debe usar T.BY_CONFIRMING para horario y dirección por defecto', () => {
            const raw = { id: 1, vacante: {} };
            const normalized = normalizeApplication(raw);
            expect(normalized.time).toBe(T.BY_CONFIRMING);
            expect(normalized.address).toBe(T.BY_CONFIRMING);
        });
    });
});

describe('notificationTranslations.js', () => {
    it('debe resolver notificaciones de PAGO_EXITOSO para empresa', () => {
        const res = resolveNotificationText('PAYMENT_SUCCESS', 'empresa', { amount: '50.000', candidateName: 'Juan' });
        expect(res.title).toBe('Comisión Pagada');
        expect(res.body).toContain('Juan');
        expect(res.body).toContain('50.000');
    });

    it('debe usar FALLBACK si el tipo no existe', () => {
        const res = resolveNotificationText('TIPO_INEXISTENTE', 'empresa');
        expect(res.title).toBe(UI_STRINGS.NOTIFICATIONS.FALLBACK_TITLE);
    });
});
