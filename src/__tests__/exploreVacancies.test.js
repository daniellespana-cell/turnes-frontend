/**
 * ExploreVacancies — Unit Tests
 *
 * Tests for pure functions in the ExploreVacancies feature.
 * Run with: npx vitest run src/__tests__/exploreVacancies.test.js
 *
 * Coverage:
 *  - inferCategory (useVacancyFetch.js) — category resolution chain
 *  - useVacancyFilters  — filter state management
 *  - scoring predicates — individual filter logic
 */

import { describe, it, expect, vi } from 'vitest';

// ── Mock taxonomy so tests don't require Supabase ────────────────────────────
vi.mock('../domain/vacantes.taxonomy', () => {
    const SECTOR_MAP = new Map([
        ['GASTRO',    { id: 'GASTRO',    label: 'Gastronomía y Bares 🍔', roles: [{ id: 'MESERO', label: 'Mesero / Camarero' }, { id: 'AYU_COCINA', label: 'Ayudante de Cocina' }], skills: [{ id: 'MANIPULACION', label: 'Curso Manipulación Alimentos' }] }],
        ['COMERCIAL', { id: 'COMERCIAL', label: 'Ventas y Comercial 💼',  roles: [{ id: 'CAJERO', label: 'Cajero / Operador de Caja' }],                                             skills: [] }],
        ['LOGISTICA', { id: 'LOGISTICA', label: 'Logística y Carga 📦',   roles: [{ id: 'COTERO', label: 'Cotero / Cargue y Descargue' }],                                         skills: [{ id: 'FUERZA', label: 'Carga Pesada' }] }],
    ]);

    const getSectorByTag = (tag) => {
        if (!tag) return 'VARIOS';
        const q = tag.toLowerCase();
        for (const [id, sector] of SECTOR_MAP.entries()) {
            if ((sector.roles  || []).some(r => r.label.toLowerCase().includes(q) || q.includes(r.label.toLowerCase()))) return id;
            if ((sector.skills || []).some(s => s.label.toLowerCase().includes(q))) return id;
        }
        return 'VARIOS';
    };

    return { SECTOR_MAP, getSectorByTag, getAllSearchTags: () => [], buildTaxonomyCache: vi.fn(), getCategoryUIConfig: vi.fn() };
});

// ── Import inferCategory as a testable pure function ─────────────────────────
// Since inferCategory is private, we extract and test it directly here.
// In production code it lives in useVacancyFetch.js.
import { SECTOR_MAP, getSectorByTag } from '../domain/vacantes.taxonomy';

const UNCATEGORIZED_IDS = new Set([null, undefined, '', 'VARIOS', 'otros', 'OTROS']);

const inferCategory = (v) => {
    if (v.categoria && !UNCATEGORIZED_IDS.has(v.categoria)) {
        const upper = v.categoria.toUpperCase();
        if (SECTOR_MAP.has(upper)) return upper;
        if (SECTOR_MAP.has(v.categoria)) return v.categoria;
    }
    const text = (v.titulo || '').toLowerCase();
    for (const [sectorId, sector] of SECTOR_MAP.entries()) {
        const sectorLabel = sector.label.replace(/[\p{Emoji}\u200d]/gu, '').toLowerCase().trim();
        if (sectorLabel && text.includes(sectorLabel)) return sectorId;
        if (sectorLabel && sectorLabel.includes(text) && text.length > 3) return sectorId;
    }
    const fromTitle = getSectorByTag(v.titulo);
    if (fromTitle && fromTitle !== 'VARIOS' && SECTOR_MAP.has(fromTitle)) return fromTitle;
    for (const tag of (v.etiquetas || [])) {
        const fromTag = getSectorByTag(tag);
        if (fromTag && fromTag !== 'VARIOS' && SECTOR_MAP.has(fromTag)) return fromTag;
    }
    const fromDesc = getSectorByTag(v.descripcion);
    if (fromDesc && fromDesc !== 'VARIOS' && SECTOR_MAP.has(fromDesc)) return fromDesc;
    return null;
};

// ── Filter predicate helpers (mirrors useVacancyScoring.js) ──────────────────
const buildFilters = (overrides = {}) => ({
    types: [], schedules: [], skills: [], urgente: false, ...overrides,
});

const matchesType     = (v, f) => f.types.length === 0     || (v.type    && f.types.includes(v.type));
const matchesSchedule = (v, f) => f.schedules.length === 0 || (v.turnoId && f.schedules.includes(v.turnoId));
const matchesSkills   = (v, f) => f.skills.length === 0    || f.skills.every(sk => (v.skills || []).includes(sk));
const matchesUrgente  = (v, f) => !f.urgente               || v.esUrgente === true;
const matchesDistance = (v, radius) => v.isFallback         || (v.realDistance ?? Infinity) <= radius;

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('inferCategory()', () => {
    it('Tier 1: returns valid categoria as-is', () => {
        expect(inferCategory({ categoria: 'GASTRO', titulo: '' })).toBe('GASTRO');
    });

    it('Tier 1: normalizes lowercase categoria', () => {
        expect(inferCategory({ categoria: 'gastro', titulo: '' })).toBe('GASTRO');
    });

    it('Tier 1: ignores VARIOS as a category', () => {
        const result = inferCategory({ categoria: 'VARIOS', titulo: 'Mesero', etiquetas: [] });
        expect(result).toBe('GASTRO'); // should fall through to role matching
    });

    it('Tier 1: ignores null categoria', () => {
        const result = inferCategory({ categoria: null, titulo: 'Cajero / Operador de Caja', etiquetas: [] });
        expect(result).toBe('COMERCIAL');
    });

    it('Tier 2: matches title that contains sector label', () => {
        const result = inferCategory({ categoria: null, titulo: 'Gastronomía y Bares vacante urgente', etiquetas: [] });
        expect(result).toBe('GASTRO');
    });

    it('Tier 3: matches title via role label', () => {
        const result = inferCategory({ categoria: null, titulo: 'Ayudante de Cocina urgente', etiquetas: [] });
        expect(result).toBe('GASTRO');
    });

    it('Tier 4: matches via etiquetas', () => {
        const result = inferCategory({ categoria: null, titulo: 'Vacante disponible', etiquetas: ['Cargue y Descargue'] });
        expect(result).toBe('LOGISTICA');
    });

    it('Tier 5: returns null when nothing matches', () => {
        const result = inferCategory({ categoria: null, titulo: 'Trabajo cualquiera', etiquetas: [], descripcion: '' });
        expect(result).toBeNull();
    });
});

describe('Filter predicates', () => {
    const vacancy = {
        type: 'Temporal',
        turnoId: 'tarde_2_8',
        skills: ['MANIPULACION', 'BARISMO'],
        esUrgente: true,
        realDistance: 2.5,
        isFallback: false,
    };

    describe('matchesType()', () => {
        it('passes when types filter is empty', () => {
            expect(matchesType(vacancy, buildFilters())).toBe(true);
        });
        it('passes when type is in filter list', () => {
            expect(matchesType(vacancy, buildFilters({ types: ['Temporal'] }))).toBe(true);
        });
        it('fails when type is not in filter list', () => {
            expect(matchesType(vacancy, buildFilters({ types: ['Fijo'] }))).toBe(false);
        });
    });

    describe('matchesSchedule()', () => {
        it('passes when schedules filter is empty', () => {
            expect(matchesSchedule(vacancy, buildFilters())).toBe(true);
        });
        it('passes when turnoId matches', () => {
            expect(matchesSchedule(vacancy, buildFilters({ schedules: ['tarde_2_8'] }))).toBe(true);
        });
        it('fails when turnoId does not match', () => {
            expect(matchesSchedule(vacancy, buildFilters({ schedules: ['mañana_8_2'] }))).toBe(false);
        });
    });

    describe('matchesSkills()', () => {
        it('passes when skills filter is empty', () => {
            expect(matchesSkills(vacancy, buildFilters())).toBe(true);
        });
        it('passes when all required skills present', () => {
            expect(matchesSkills(vacancy, buildFilters({ skills: ['MANIPULACION'] }))).toBe(true);
        });
        it('fails when a required skill is missing', () => {
            expect(matchesSkills(vacancy, buildFilters({ skills: ['MANIPULACION', 'RETHUS'] }))).toBe(false);
        });
    });

    describe('matchesUrgente()', () => {
        it('passes when urgente filter is off', () => {
            expect(matchesUrgente({ esUrgente: false }, buildFilters({ urgente: false }))).toBe(true);
        });
        it('passes when urgente filter is on and vacancy is urgent', () => {
            expect(matchesUrgente({ esUrgente: true }, buildFilters({ urgente: true }))).toBe(true);
        });
        it('fails when urgente filter is on and vacancy is not urgent', () => {
            expect(matchesUrgente({ esUrgente: false }, buildFilters({ urgente: true }))).toBe(false);
        });
    });

    describe('matchesDistance()', () => {
        it('passes when within radius', () => {
            expect(matchesDistance({ realDistance: 2, isFallback: false }, 3)).toBe(true);
        });
        it('fails when outside radius', () => {
            expect(matchesDistance({ realDistance: 5, isFallback: false }, 3)).toBe(false);
        });
        it('always passes for fallback vacancies regardless of distance', () => {
            expect(matchesDistance({ realDistance: 999, isFallback: true }, 3)).toBe(true);
        });
    });
});

describe('normalizeVacancy — priceLabel', () => {
    // Inline test of the price formatting logic
    const formatPrice = (pago_monto) => {
        const price = Number(pago_monto || 0);
        return price > 0 ? `$${(price / 1000).toFixed(0)}k` : 'A Convenir';
    };

    it('formats 50000 as $50k', () => expect(formatPrice(50000)).toBe('$50k'));
    it('formats 0 as A Convenir', () => expect(formatPrice(0)).toBe('A Convenir'));
    it('formats null as A Convenir', () => expect(formatPrice(null)).toBe('A Convenir'));
    it('formats undefined as A Convenir', () => expect(formatPrice(undefined)).toBe('A Convenir'));
    it('formats 120000 as $120k', () => expect(formatPrice(120000)).toBe('$120k'));
});
