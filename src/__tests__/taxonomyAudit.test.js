import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SECTOR_MAP,
  getSectorByTag,
  getAllSearchTags,
  getSkillsBySector,
  getRolesBySector,
  syncTaxonomyWithDB
} from '../domain/vacantes.taxonomy';
import { TaxonomyService } from '../services/taxonomyService';

describe('🔬 Taxonomy Engine & Gastro Audit', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Debe contener Parrillero, Planchero, Parrilla y Plancha en el sector GASTRO por defecto', () => {
    const gastroSector = SECTOR_MAP.get('GASTRO');
    expect(gastroSector).toBeDefined();

    const roles = gastroSector.roles || [];
    const skills = gastroSector.skills || [];

    const parrilleroRole = roles.find(r => r.id === 'PARRILLERO');
    const plancheroRole = roles.find(r => r.id === 'PLANCHERO');
    const parrillaSkill = skills.find(s => s.id === 'PARRILLA');
    const planchaSkill = skills.find(s => s.id === 'PLANCHA');

    expect(parrilleroRole).toBeDefined();
    expect(parrilleroRole.label).toContain('Parrillero');

    expect(plancheroRole).toBeDefined();
    expect(plancheroRole.label).toContain('Planchero');

    expect(parrillaSkill).toBeDefined();
    expect(parrillaSkill.label).toMatch(/parrill/i);

    expect(planchaSkill).toBeDefined();
    expect(planchaSkill.label).toMatch(/planch/i);
  });

  it('2. getSectorByTag debe resolver a GASTRO para todas las variantes de parrillero, parrilla, asador y plancha', () => {
    expect(getSectorByTag('parrillero')).toBe('GASTRO');
    expect(getSectorByTag('Parrillero')).toBe('GASTRO');
    expect(getSectorByTag('Parrillero / Asador')).toBe('GASTRO');
    expect(getSectorByTag('#parrillero')).toBe('GASTRO');
    expect(getSectorByTag('asador')).toBe('GASTRO');
    expect(getSectorByTag('parrilla')).toBe('GASTRO');
    expect(getSectorByTag('Parrilla')).toBe('GASTRO');
    expect(getSectorByTag('planchero')).toBe('GASTRO');
    expect(getSectorByTag('Planchero')).toBe('GASTRO');
    expect(getSectorByTag('plancha')).toBe('GASTRO');
    expect(getSectorByTag('#plancha')).toBe('GASTRO');
  });

  it('3. getAllSearchTags debe incluir términos de Parrillero y Plancha para autocompletado en vacantes', () => {
    const tags = getAllSearchTags();
    const hasParrillero = tags.some(t => /parrill/i.test(t));
    const hasPlanchero = tags.some(t => /planch/i.test(t));

    expect(hasParrillero).toBe(true);
    expect(hasPlanchero).toBe(true);
  });

  it('4. syncTaxonomyWithDB debe realizar un Deep Merge y NUNCA destruir Parrilla o Plancha si la DB devuelve datos parciales', async () => {
    // Simular que Supabase solo tiene sectores y 1 skill vieja (sin PARRILLA ni PLANCHA)
    vi.spyOn(TaxonomyService, 'getSectors').mockResolvedValue({
      data: [
        { id: 'GASTRO', label: 'Gastronomía y Bares 🍔', is_active: true }
      ],
      error: null
    });
    vi.spyOn(TaxonomyService, 'getRoles').mockResolvedValue({
      data: [
        { id: 'MESERO', sector_id: 'GASTRO', label: 'Mesero Pro', is_active: true }
      ],
      error: null
    });
    vi.spyOn(TaxonomyService, 'getSkills').mockResolvedValue({
      data: [
        { id: 'MANIPULACION', sector_id: 'GASTRO', label: 'Curso Manipulación DB', is_active: true }
      ],
      error: null
    });

    await syncTaxonomyWithDB();

    const gastroSkills = getSkillsBySector('GASTRO');
    const gastroRoles = getRolesBySector('GASTRO');

    // Debe conservar PARRILLA y PLANCHA del fallback local
    const hasParrilla = gastroSkills.some(s => s.id === 'PARRILLA');
    const hasPlancha = gastroSkills.some(s => s.id === 'PLANCHA');
    expect(hasParrilla).toBe(true);
    expect(hasPlancha).toBe(true);

    // Debe conservar PARRILLERO y PLANCHERO en roles
    const hasParrilleroRole = gastroRoles.some(r => r.id === 'PARRILLERO');
    const hasPlancheroRole = gastroRoles.some(r => r.id === 'PLANCHERO');
    expect(hasParrilleroRole).toBe(true);
    expect(hasPlancheroRole).toBe(true);

    // Debe haber actualizado MESERO con lo que vino de la DB
    const meseroRole = gastroRoles.find(r => r.id === 'MESERO');
    expect(meseroRole.label).toBe('Mesero Pro');

    // Debe seguir resolviendo getSectorByTag('parrillero') a GASTRO
    expect(getSectorByTag('parrillero')).toBe('GASTRO');
    expect(getSectorByTag('plancha')).toBe('GASTRO');
  });
});
