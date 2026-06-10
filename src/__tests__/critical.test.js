import { describe, it, expect } from 'vitest';
import {
    normalizeCandidateProfile,
    normalizeCompanyProfile,
    normalizeChatContext
} from '../domain/profile.mapper';
import { UI_STRINGS } from '../domain/uiTranslations';

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
            expect(result.rating).toBe(5.0);
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
});
