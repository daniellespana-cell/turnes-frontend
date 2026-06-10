import { describe, it, expect, vi } from 'vitest';
import { normalizeCheckoutItem } from '../utils/pricingHelpers';
import { getSessionCache, setSessionCache, clearSessionCache } from '../utils/sessionCache';
import { UI_STRINGS } from '../domain/uiTranslations';

// Mock formatCurrency to avoid dependency on financeService
vi.mock('../services/financeService', () => ({
    formatCurrency: (amount) => `$${amount}`,
}));

describe('utils/pricingHelpers.js', () => {
    const P = UI_STRINGS.PRICING;

    it('debe normalizar un plan gratuito', () => {
        const raw = { id: '1', slug: 'free', nombre: 'Esencial', costo_mensual: 0 };
        const res = normalizeCheckoutItem(raw, 'plan');
        expect(res.price).toBe(P.FREE);
        expect(res.period).toBe(P.FOREVER);
    });

    it('debe normalizar un plan de pago', () => {
        const raw = { id: '2', slug: 'pro', nombre: 'Pro', costo_mensual: 50000 };
        const res = normalizeCheckoutItem(raw, 'plan');
        expect(res.price).toBe('$50000');
        expect(res.period).toBe(P.MONTHLY);
    });

    it('debe normalizar un servicio (pago único)', () => {
        const raw = { id: '3', slug: 'verify', title: 'Validación', price: 10000 };
        const res = normalizeCheckoutItem(raw, 'service');
        expect(res.period).toBe(P.SINGLE_PAYMENT);
        expect(res.terms).toBe(P.NON_RECURRING);
    });

    it('debe aplicar "force service" para slugs de legado (verify, boost)', () => {
        const raw = { id: '4', slug: 'boost', nombre: 'Boost', costo_mensual: 15000 };
        const res = normalizeCheckoutItem(raw, 'plan');
        expect(res.type).toBe('service');
        expect(res.period).toBe(P.SINGLE_PAYMENT);
    });
});

describe('utils/sessionCache.js', () => {
    it('debe manejar el ciclo de vida del caché', () => {
        clearSessionCache();
        expect(getSessionCache().data).toBeNull();
        expect(getSessionCache().fetched).toBe(false);

        setSessionCache({ user: 'test' });
        expect(getSessionCache().data.user).toBe('test');
        expect(getSessionCache().fetched).toBe(true);

        clearSessionCache();
        expect(getSessionCache().data).toBeNull();
    });
});
