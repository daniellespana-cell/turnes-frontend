/**
 * 🧠 TURNES TAXONOMY ENGINE
 *
 * Responsabilidad ÚNICA: Motor de búsqueda O(1) + sincronización con Supabase.
 * Los DATOS viven en la DB (taxonomy_sectors/roles/skills).
 * Este fallback local es el esqueleto mínimo para arranque offline/rápido.
 *
 * Para agregar un sector o cargo: INSERT en las tablas de Supabase.
 * NO editar los datos aquí directamente.
 */
import { TaxonomyService } from '../services/taxonomyService';
import { logger } from '../utils/logger';

// ── FALLBACK LOCAL MÍNIMO ────────────────────────────────────
// Solo id + label para que el autocomplete y las categorías funcionen sin DB.
// Los detalles (skills, marketing, slugs) vienen siempre del sync con Supabase.
const FALLBACK_TAXONOMY = {
  GASTRO: { id: 'GASTRO', label: 'Gastronomía y Bares 🍔', ui: { icon: 'Utensils', color: 'text-orange-500', hex: '#f97316' }, roles: [{ id: 'MESERO', label: 'Mesero / Camarero' }, { id: 'BARTENDER', label: 'Bartender / Barman' }, { id: 'BARISTA', label: 'Barista Profesional' }, { id: 'COCINERO', label: 'Cocinero (General)' }, { id: 'AYU_COCINA', label: 'Ayudante de Cocina' }, { id: 'PARRILLERO', label: 'Parrillero / Asador' }, { id: 'PLANCHERO', label: 'Planchero / Comida Rápida' }, { id: 'LAVAPLATOS', label: 'Lavaplatos / Steward' }, { id: 'DOMICILIARIO', label: 'Domiciliario (Moto/Bici)' }, { id: 'REPOSTERO', label: 'Repostero / Pastelero' }, { id: 'PANADERO', label: 'Panadero' }, { id: 'COMIDA_RAPIDA', label: 'Operario de Comida Rápida' }], skills: [{ id: 'MANIPULACION', label: 'Curso Manipulación Alimentos' }, { id: 'COCTELERIA', label: 'Coctelería' }, { id: 'BARISMO', label: 'Máquina de Café' }, { id: 'PARRILLA', label: 'Parrillero / Asados' }, { id: 'PLANCHA', label: 'Planchero / Manejo de Plancha' }] },
  COMERCIAL: { id: 'COMERCIAL', label: 'Ventas y Comercial 💼', ui: { icon: 'TrendingUp', color: 'text-green-500', hex: '#22c55e' }, roles: [{ id: 'VENDEDOR_TAT', label: 'Vendedor TAT / Canal Tradicional' }, { id: 'IMPULSOR', label: 'Impulsor / Promotor de Marca' }, { id: 'CAJERO', label: 'Cajero / Operador de Caja' }, { id: 'ASESOR_VENTAS', label: 'Asesor Comercial' }, { id: 'MERCADERISTA', label: 'Mercaderista' }], skills: [{ id: 'EXP_VENTAS', label: 'Experiencia en Ventas' }, { id: 'MOTO_COM', label: 'Moto Propia + SOAT' }] },
  LOGISTICA: { id: 'LOGISTICA', label: 'Logística y Carga 📦', ui: { icon: 'Truck', color: 'text-blue-500', hex: '#3b82f6' }, roles: [{ id: 'COTERO', label: 'Cotero / Cargue y Descargue' }, { id: 'BODEGUERO', label: 'Auxiliar de Bodega' }, { id: 'EMPACADOR', label: 'Empacador / Picking' }, { id: 'MENSAJERO', label: 'Mensajero en Moto' }, { id: 'AUX_CAMION', label: 'Auxiliar de Ruta / Camión' }], skills: [{ id: 'FUERZA', label: 'Carga Pesada' }, { id: 'INV_BASICO', label: 'Inventarios' }] },
  CONSTRUCCION: { id: 'CONSTRUCCION', label: 'Construcción y Mantenimiento 🏗️', ui: { icon: 'Hammer', color: 'text-amber-500', hex: '#f59e0b' }, roles: [{ id: 'AYU_OBRA', label: 'Ayudante de Obra' }, { id: 'OFICIAL', label: 'Oficial de Obra' }, { id: 'PINTOR', label: 'Pintor / Estucador' }, { id: 'ELECTRICISTA', label: 'Electricista Básico' }, { id: 'PLOMERO', label: 'Plomero / Fontanero' }, { id: 'TODERO', label: 'Todero' }, { id: 'SOLDADOR', label: 'Soldador' }], skills: [{ id: 'ALTURAS', label: 'Curso de Alturas' }, { id: 'HERRAMIENTA', label: 'Herramienta Propia' }] },
  TRANSPORTE: { id: 'TRANSPORTE', label: 'Transporte y Movilidad 🚗', ui: { icon: 'Car', color: 'text-zinc-400', hex: '#a1a1aa' }, roles: [{ id: 'CONDUCTOR', label: 'Conductor / Chofer' }, { id: 'TAXISTA', label: 'Taxista Profesional' }, { id: 'CONDUCTOR_APPS', label: 'Conductor Plataformas (Apps)' }, { id: 'LAVADOR_VEHICULOS', label: 'Lavador de Carros / Motos' }, { id: 'MECANICO', label: 'Mecánico de Carro / Moto' }, { id: 'LATONERO', label: 'Pintor de Latonería' }], skills: [{ id: 'LICENCIA_C2', label: 'Licencia de Conducción B1/C2/C3' }] },
  EVENTOS: { id: 'EVENTOS', label: 'Eventos y Entretenimiento 🎉', ui: { icon: 'Music', color: 'text-indigo-500', hex: '#6366f1' }, roles: [{ id: 'LOGISTICA_EV', label: 'Logística de Eventos' }, { id: 'BOUNCER', label: 'Seguridad / Bouncer' }, { id: 'PROTOCOLO_EV', label: 'Modelo de Protocolo / Azafata' }, { id: 'ANIMADOR', label: 'Animador / Recreacionista' }, { id: 'DJ', label: 'DJ / Operador de Sonido' }], skills: [{ id: 'PRESENCIA', label: 'Presentación Personal' }, { id: 'INGLES_EV', label: 'Inglés Conversacional' }] },
  BELLEZA: { id: 'BELLEZA', label: 'Belleza y Estética 💅', ui: { icon: 'Scissors', color: 'text-pink-500', hex: '#ec4899' }, roles: [{ id: 'MANICURISTA', label: 'Manicurista' }, { id: 'ESTILISTA', label: 'Estilista / Peluquero(a)' }, { id: 'BARBERO', label: 'Barbero' }, { id: 'MAQUILLADORA', label: 'Maquilladora' }, { id: 'PEDICURISTA', label: 'Pedicurista' }], skills: [{ id: 'KIT_PROPIO', label: 'Insumos Propios' }, { id: 'COLOR', label: 'Colorimetría' }] },
  SALUD_CUIDADO: { id: 'CUIDADO', label: 'Salud y Cuidado de Personas 🩺', ui: { icon: 'Heart', color: 'text-rose-500', hex: '#f43f5e' }, roles: [{ id: 'ENFERMERA', label: 'Enfermera(o) Domiciliaria' }, { id: 'CUIDADOR_AM', label: 'Cuidador de Adulto Mayor' }, { id: 'NINERA', label: 'Niñera / Babysitter' }, { id: 'TERAPEUTA', label: 'Terapeuta' }], skills: [{ id: 'RETHUS', label: 'Registro RETHUS' }, { id: 'PRIMEROS_AUX', label: 'Primeros Auxilios' }] },
  HOGAR: { id: 'HOGAR', label: 'Hogar y Limpieza 🧹', ui: { icon: 'Home', color: 'text-purple-500', hex: '#a855f7' }, roles: [{ id: 'ASEO_DIAS', label: 'Empleada por días' }, { id: 'COCINERA_DOM', label: 'Cocinera Doméstica' }, { id: 'JARDINERO', label: 'Jardinero' }, { id: 'CUIDADO_MASCOTA', label: 'Cuidador de Mascotas' }], skills: [{ id: 'REFERENCIAS', label: 'Referencias Laborales' }] },
  MANUFACTURA: { id: 'MANUFACTURA', label: 'Manufactura e Industria 🏭', ui: { icon: 'Factory', color: 'text-cyan-500', hex: '#06b6d4' }, roles: [{ id: 'OPERARIO_LINEA', label: 'Operario de Línea de Producción' }, { id: 'ENSAMBLADOR', label: 'Ensamblador' }, { id: 'CALIDAD', label: 'Inspector de Calidad' }, { id: 'MAQUI_COSTURA', label: 'Maquinista de Confección' }], skills: [{ id: 'MAQUINARIA', label: 'Maquinaria Industrial' }] },
  CALL_CENTER: { id: 'CALL_CENTER', label: 'Call Center y BPO 🎧', ui: { icon: 'Phone', color: 'text-sky-500', hex: '#0ea5e9' }, roles: [{ id: 'AGENTE_CALL', label: 'Agente de Call Center' }, { id: 'AGENTE_VENTAS_TEL', label: 'Asesor de Ventas Telefónicas' }, { id: 'SOPORTE_TEC', label: 'Agente Soporte Técnico' }, { id: 'BACK_OFFICE', label: 'Digitador / Back Office' }], skills: [{ id: 'DICCION', label: 'Dicción y Comunicación' }] },
  SEGURIDAD: { id: 'SEGURIDAD', label: 'Seguridad y Vigilancia 🛡️', ui: { icon: 'Shield', color: 'text-slate-400', hex: '#94a3b8' }, roles: [{ id: 'VIGILANTE', label: 'Vigilante / Celador' }, { id: 'GUARDIA_CORP', label: 'Guardia Corporativo' }, { id: 'ESCOLTA', label: 'Escolta' }], skills: [{ id: 'VIGILANTE_LIC', label: 'Curso SuperVigilancia' }] },
  ASEO_EMP: { id: 'ASEO_EMP', label: 'Aseo Empresarial 🧽', ui: { icon: 'Sparkles', color: 'text-teal-500', hex: '#14b8a6' }, roles: [{ id: 'ASEADORA', label: 'Aseadora de Oficinas' }, { id: 'ASEADORA_HOSP', label: 'Aseadora de Clínica / Hospital' }, { id: 'OPERARIO_ASEO', label: 'Operario de Servicios Generales' }], skills: [{ id: 'QUIMICOS', label: 'Productos Químicos de Limpieza' }] },
  TECNOLOGIA: { id: 'TECNOLOGIA', label: 'Tecnología y Sistemas 💻', ui: { icon: 'Monitor', color: 'text-violet-500', hex: '#8b5cf6' }, roles: [{ id: 'TEC_SISTEMAS', label: 'Técnico en Sistemas' }, { id: 'TEC_REDES', label: 'Técnico en Redes' }, { id: 'SOPORTE_IT', label: 'Soporte Técnico IT' }], skills: [{ id: 'REDES_BASICA', label: 'Redes (CCNA/CompTIA)' }] },
  EDUCACION: { id: 'EDUCACION', label: 'Educación y Capacitación 📚', ui: { icon: 'BookOpen', color: 'text-yellow-500', hex: '#eab308' }, roles: [{ id: 'DOCENTE_REMP', label: 'Docente de Reemplazo' }, { id: 'TUTOR', label: 'Tutor Académico' }, { id: 'MONITOR', label: 'Monitor / Instructor' }], skills: [{ id: 'LICENCIADO', label: 'Licenciado / Normalista' }] },
  AGRO: { id: 'AGRO', label: 'Agro y Campo 🚜', ui: { icon: 'Leaf', color: 'text-emerald-500', hex: '#10b981' }, roles: [{ id: 'RECOLECTOR', label: 'Recolector (Cosecha)' }, { id: 'JORNALERO', label: 'Jornalero' }, { id: 'GALPONERO', label: 'Galponero' }, { id: 'MAYORDOMO', label: 'Mayordomo / Casero' }], skills: [{ id: 'GUADANA', label: 'Guadaña' }, { id: 'ANIMALES', label: 'Animales de Granja' }] },
};

// ── MAPS O(1) ────────────────────────────────────────────────
export const SECTOR_MAP = new Map();
export const ROLE_MAP = new Map();
export const SLUG_MAP = new Map();
export const ALL_TAGS_CACHE = new Set();
export let CATEGORIAS_ARRAY_CACHE = [];
export let ALL_TAGS_ARRAY_CACHE = [];

export const buildTaxonomyCache = (source) => {
  SECTOR_MAP.clear(); ROLE_MAP.clear(); SLUG_MAP.clear(); ALL_TAGS_CACHE.clear();

  Object.values(source).forEach(sector => {
    SECTOR_MAP.set(sector.id, sector);
    ALL_TAGS_CACHE.add(sector.label);
    (sector.roles || []).forEach(r => { ROLE_MAP.set(r.id, r); if (r.slug) SLUG_MAP.set(r.slug, r); ALL_TAGS_CACHE.add(r.label); });
    (sector.skills || []).forEach(s => ALL_TAGS_CACHE.add(s.label));
  });

  CATEGORIAS_ARRAY_CACHE = Array.from(SECTOR_MAP.values())
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(({ id, label, description }) => ({ id, label, description }));

  ALL_TAGS_ARRAY_CACHE = Array.from(ALL_TAGS_CACHE);
};

// Inicialización inmediata con fallback local
buildTaxonomyCache(FALLBACK_TAXONOMY);

// ── SYNC CON SUPABASE ────────────────────────────────────────
export const syncTaxonomyWithDB = async () => {
  try {
    const [sectorsRes, rolesRes, skillsRes] = await Promise.all([
      TaxonomyService.getSectors(),
      TaxonomyService.getRoles(),
      TaxonomyService.getSkills(),
    ]);

    if (sectorsRes.error || !sectorsRes.data?.length) {
      console.warn('[Taxonomy] DB vacía/error — usando fallback local.', sectorsRes.error?.message);
      return;
    }

    const dynamic = {};
    sectorsRes.data.forEach(s => {
      dynamic[s.id] = { ...s, roles: [], skills: [] };
    });
    rolesRes.data?.forEach(r => {
      if (dynamic[r.sector_id]) dynamic[r.sector_id].roles.push({
        id: r.id, label: r.label, slug: r.slug,
        ...(r.marketing_title && {
          marketing: {
            title: r.marketing_title, accentColor: r.marketing_accent_color,
            description: r.marketing_description,
            job: { title: r.job_demo_title, salary: r.job_demo_salary, location: r.job_demo_location, hours: r.job_demo_hours, reqs: r.job_demo_reqs }
          }
        })
      });
    });
    skillsRes.data?.forEach(s => {
      if (dynamic[s.sector_id]) dynamic[s.sector_id].skills.push({ id: s.id, label: s.label });
    });

    buildTaxonomyCache(dynamic);
    logger.info('[Taxonomy] ✅ Sincronizado desde DB.');
  } catch (e) {
    if (e.name !== 'AbortError') console.warn('[Taxonomy] Sync fallido — operando offline.', e);
  }
};

// ── TURNOS ───────────────────────────────────────────────────
export const TURNOS_PREDEFINIDOS = [
  { id: 'mañana_8_2', label: 'Mañana (08:00 AM - 02:00 PM)', hours: 6 },
  { id: 'tarde_2_8', label: 'Tarde (02:00 PM - 08:00 PM)', hours: 6 },
  { id: 'noche_8_2', label: 'Noche (08:00 PM - 02:00 AM)', hours: 6 },
  { id: 'trasnocho_10_6', label: 'Trasnocho (10:00 PM - 06:00 AM)', hours: 8 },
  { id: 'dia_completo', label: 'Jornada Día (08:00 AM - 05:00 PM)', hours: 9 },
  { id: 'por_hora', label: 'Horario Personalizado (Definir en chat)', hours: 0 },
];

// ── UTILIDADES O(1) ──────────────────────────────────────────
export const getCategoriasList = () => CATEGORIAS_ARRAY_CACHE;
export const getRolesBySector = (id) => SECTOR_MAP.get(id)?.roles || [];
export const getSkillsBySector = (id) => SECTOR_MAP.get(id)?.skills || [];
export const getRoleLabel = (id) => ROLE_MAP.get(id)?.label || id;
export const getAllSearchTags = () => ALL_TAGS_ARRAY_CACHE;
export const getRoleBySlug = (slug) => SLUG_MAP.get(slug) || null;
export const getCategoryUIConfig = (catId) => {
  const s = SECTOR_MAP.get(catId);
  return { ...(s?.ui || { icon: 'Grid', color: 'text-zinc-500', hex: '#71717a' }), label: s?.label || 'Otros' };
};

// FIX: case-insensitive + fuzzy match en sector, roles y skills
export const getSectorByTag = (tagLabel) => {
  if (!tagLabel) return 'VARIOS';
  const q = tagLabel.toLowerCase().trim();
  for (const [sectorId, sector] of SECTOR_MAP.entries()) {
    if (sector.id.toLowerCase() === q || sector.label.toLowerCase().includes(q) || q.includes(sector.label.toLowerCase())) return sectorId;
    if ((sector.roles || []).some(r => r.label.toLowerCase().includes(q) || q.includes(r.label.toLowerCase()))) return sectorId;
    if ((sector.skills || []).some(s => s.label.toLowerCase().includes(q) || q.includes(s.label.toLowerCase()))) return sectorId;
  }
  return 'VARIOS';
};