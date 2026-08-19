import { describe, it, expect, vi } from 'vitest';
import {
    normalizeCandidateProfile,
    normalizeCompanyProfile,
    normalizeChatContext
} from '../domain/profile.mapper';
import { UI_STRINGS } from '../domain/uiTranslations';

vi.mock('@sentry/react', () => ({
    init: vi.fn(),
    setUser: vi.fn(),
    captureException: vi.fn().mockReturnValue('mock-event-id'),
    captureMessage: vi.fn(),
    addBreadcrumb: vi.fn(),
    browserTracingIntegration: vi.fn()
}));

// ═══════════════════════════════════════════════════════════════════
// PROFILE MAPPER — Tests de normalización de perfiles
// ═══════════════════════════════════════════════════════════════════

const P = UI_STRINGS.PROFILE;

describe('profile.mapper.js', () => {

    describe('normalizeCandidateProfile', () => {
        it('debe devolver null si raw es null', () => {
            expect(normalizeCandidateProfile(null)).toBeNull();
        });

        it('debe usar fallbacks del diccionario si no hay datos', () => {
            const result = normalizeCandidateProfile({ id: 'abc' });
            expect(result.name).toBe(P.DEFAULT_NAME);
            expect(result.role).toBe(P.DEFAULT_ROLE);
            expect(result.bio).toBe(P.NO_BIO);
            expect(result.rating).toBe('5.0');
            expect(result.verified).toBe(false);
        });

        it('debe priorizar nombre_display sobre name', () => {
            const result = normalizeCandidateProfile({
                id: '1',
                nombre_display: 'Juan Pérez',
                name: 'John Doe'
            });
            expect(result.name).toBe('Juan Pérez');
        });

        it('debe extraer el primer skill como rol', () => {
            const result = normalizeCandidateProfile({
                id: '1',
                skills: ['Chef', 'Mesero']
            });
            expect(result.role).toBe('Chef');
        });
    });

    describe('normalizeCompanyProfile', () => {
        it('debe devolver null si raw es null', () => {
            expect(normalizeCompanyProfile(null)).toBeNull();
        });

        it('debe usar fallback del diccionario para nombre', () => {
            const result = normalizeCompanyProfile({ id: 'xyz' });
            expect(result.name).toBe(P.DEFAULT_COMPANY);
        });

        it('debe priorizar nombre_comercial', () => {
            const result = normalizeCompanyProfile({
                id: '1',
                nombre_comercial: 'Turnes SAS',
                name: 'Turnes Inc'
            });
            expect(result.name).toBe('Turnes SAS');
        });
    });

    describe('normalizeChatContext', () => {
        it('debe devolver null si data es null', () => {
            expect(normalizeChatContext(null)).toBeNull();
        });

        it('debe usar fallbacks cuando no hay empresa ni candidato', () => {
            const result = normalizeChatContext({ id: 'chat-1' });
            expect(result.company).toBe(P.DEFAULT_COMPANY);
            expect(result.candidate).toBe(P.DEFAULT_CANDIDATE);
        });

        it('debe extraer empresa desde vacante.empresas', () => {
            const result = normalizeChatContext({
                id: 'chat-1',
                vacante: {
                    empresas: { nombre_comercial: 'CoffeeCo' }
                }
            });
            expect(result.company).toBe('CoffeeCo');
        });

        it('debe priorizar companyData sobre vacante.empresas', () => {
            const result = normalizeChatContext(
                {
                    id: 'chat-1',
                    vacante: { empresas: { nombre_comercial: 'Empresa A' } }
                },
                { nombre_comercial: 'Empresa B' }
            );
            expect(result.company).toBe('Empresa B');
        });
    });

    describe('MatchService & Exclusion of Applied Vacancies', () => {
        it('debe puntuar y ordenar vacantes sin lanzar ReferenceError', async () => {
            const { MatchService } = await import('../services/matchService');
            const mockVacancies = [
                { id: 'v1', title: 'Barista', skills: ['barista'], lat: 4.6097, lng: -74.0817 },
                { id: 'v2', title: 'Chef', skills: ['cocina'], lat: 4.6097, lng: -74.0817 },
            ];
            const userProfile = {
                skills: ['barista'],
                lat: 4.6097,
                lng: -74.0817
            };
            const scored = MatchService.scoreVacancies(mockVacancies, userProfile);
            expect(scored.length).toBe(2);
            expect(scored[0].id).toBe('v1'); // Mayor coincidencia con barista

            // Probar exclusión reactiva de postuladas
            const appliedIds = new Set(['v1']);
            const unappliedScored = scored.filter(v => !appliedIds.has(v.id));
            expect(unappliedScored.length).toBe(1);
            expect(unappliedScored[0].id).toBe('v2');
        });
    });

    describe('FinanceService Resilience & Mobile Reconciliation', () => {
        it('formatCurrency formatea montos en pesos colombianos y maneja fallbacks', async () => {
            const { formatCurrency } = await import('../services/financeService');
            expect(formatCurrency(50000)).toContain('50.000');
            expect(formatCurrency('invalido')).toBe('$0');
            expect(formatCurrency(null)).toBe('$0');
        });

        it('verifyTransactionStatus valida entradas nulas sin romper ejecución', async () => {
            const { FinanceService } = await import('../services/financeService');
            const res = await FinanceService.verifyTransactionStatus(null);
            expect(res.found).toBe(false);
            expect(res.status).toBe('UNKNOWN');
        });
    });

    describe('TelemetryService (SSOT Observability)', () => {
        it('maneja captura de excepciones y contexto de usuario sin fallar', async () => {
            const { telemetryService } = await import('../services/telemetryService');
            
            expect(telemetryService.isInitialized).toBeDefined();
            
            // Probar setUser sin PII
            telemetryService.setUser({ id: 'usr-123', rol: 'empresa', email: 'secret@turnes.co', plan: 'Pro' });
            expect(telemetryService.userContext).toEqual({
                id: 'usr-123',
                role: 'empresa',
                plan: 'Pro'
            });

            // Probar clearUser
            telemetryService.clearUser();
            expect(telemetryService.userContext).toBeNull();

            // Probar captureException segura
            const testError = new Error('Test Telemetry Exception');
            expect(() => telemetryService.captureException(testError, { source: 'unit_test' })).not.toThrow();

            // Probar captureMessage y addBreadcrumb
            expect(() => telemetryService.captureMessage('Operational Warning', 'warning')).not.toThrow();
            expect(() => telemetryService.addBreadcrumb('auth', 'User Login Success')).not.toThrow();
            expect(() => telemetryService.trackEvent('test_event', { step: 1 })).not.toThrow();
        });
    });

    describe('VersionService (Anti-Zombie PWA & Update Sentinel)', () => {
        it('gestiona suscripción de actualizaciones y metadatos de versión', async () => {
            const { versionService, APP_METADATA } = await import('../services/versionService');
            
            expect(APP_METADATA.VERSION).toBe('0.1.0');
            expect(versionService.updateAvailable).toBe(false);

            let notified = false;
            const unsubscribe = versionService.subscribe((hasUpdate) => {
                notified = hasUpdate;
            });

            versionService.notifyUpdateAvailable();
            expect(notified).toBe(true);
            expect(versionService.updateAvailable).toBe(true);

            unsubscribe();
        });
    });

    describe('WelcomeBonusRules (Primer Turno Gratis SSOT)', () => {
        it('valida completitud del 100% del perfil de empresa correctamente', async () => {
            const { isCompanyProfileComplete, getMissingCompanyProfileFields } = await import('../domain/welcomeBonus.rules');

            // Caso 1: Perfil completo
            const completeCompany = {
                nombre_comercial: 'Restaurante El Sol',
                nit_rut: '900123456-7',
                logo_url: 'https://turnes.co/logo.png',
                sector_industrial: 'Gastronomía'
            };
            expect(isCompanyProfileComplete(completeCompany)).toBe(true);
            expect(getMissingCompanyProfileFields(completeCompany)).toEqual([]);

            // Caso 2: Falta NIT
            const missingNit = { ...completeCompany, nit_rut: '' };
            expect(isCompanyProfileComplete(missingNit)).toBe(false);
            expect(getMissingCompanyProfileFields(missingNit)).toContain('NIT / RUT');

            // Caso 3: Falta Logo
            const missingLogo = { ...completeCompany, logo_url: null, avatar_url: undefined };
            expect(isCompanyProfileComplete(missingLogo)).toBe(false);
            expect(getMissingCompanyProfileFields(missingLogo)).toContain('Logo');

            // Caso 4: Null o undefined
            expect(isCompanyProfileComplete(null)).toBe(false);
            expect(getMissingCompanyProfileFields(null).length).toBe(4);
        });

        it('garantiza términos inequívocos que excluyen turnos fijos', async () => {
            const { WELCOME_BONUS_CONDITIONS } = await import('../domain/welcomeBonus.rules');

            expect(WELCOME_BONUS_CONDITIONS.LEGAL_TEXT).toContain('Turno Ocasional / Temporal');
            expect(WELCOME_BONUS_CONDITIONS.LEGAL_TEXT).toContain('NO aplica para contrataciones de Turnos Fijos');
            expect(WELCOME_BONUS_CONDITIONS.ELIGIBILITY_ALERT).toContain('Solo aplica para Turnos Temporales');
        });
    });
});
