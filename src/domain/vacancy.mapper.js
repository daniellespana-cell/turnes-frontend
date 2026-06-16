import { SECTOR_MAP, getSectorByTag, TURNOS_PREDEFINIDOS } from './vacantes.taxonomy';
import { UI_STRINGS } from './uiTranslations';

// ─── Constants ────────────────────────────────────────────────────────────────
const UNCATEGORIZED_IDS = new Set([null, undefined, '', 'VARIOS', 'otros', 'OTROS']);

// ─── Category Inference ───────────────────────────────────────────────────────
export const inferCategory = (v) => {
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

export const applyJitter = (rawLat, rawLng, coordCounts) => {
    const key = `${rawLat.toFixed(4)},${rawLng.toFixed(4)}`;
    const n   = coordCounts.get(key) || 0;
    coordCounts.set(key, n + 1);
    // 🚀 Senior Fix: Incremented jitter from 0.00003 to 0.0003 (~33 meters) to prevent UI marker overlap
    return { jLat: rawLat + n * 0.0003, jLng: rawLng + n * 0.0003 };
};

export const sanitize = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Normalizes a raw vacancy object from the database into a clean UI-ready DTO.
 */
export const normalizeVacancy = (v, coordCounts, isFallback = false) => {
    const T = UI_STRINGS.VACANCY;
    // 🛡️ SOPORTE POLIMÓRFICO: Maneja si Supabase devuelve objeto o array en el join
    const empresaRaw    = v.empresas || v.empresa || {};
    const empresa       = Array.isArray(empresaRaw) ? (empresaRaw[0] || {}) : empresaRaw;
    
    let business      = sanitize(v.empresa_nombre_comercial || empresa.nombre_comercial || T.CONFIDENTIAL_COMPANY);
    
    // Si el backend devolvió un email por defecto porque no hay nombre comercial
    if (business.includes('@')) {
        business = T.CONFIDENTIAL_COMPANY || 'Empresa Confidencial';
    }

    const businessLogo  = v.empresa_logo_url || empresa.logo_url || empresa.avatar_url || empresa.avatar || empresa.foto || null;
    const isVerified    = v.empresa_verificado ?? v.es_verificado ?? empresa.verificado ?? empresa.es_verificado ?? empresa.verificada ?? false;
    const rating        = empresa.calificacion        ?? 0;

    const rawLat    = parseFloat(v.lat);
    const rawLng    = parseFloat(v.lng);
    const hasCoords = v.lat != null && v.lng != null && !isNaN(rawLat) && !isNaN(rawLng);

    const { jLat, jLng } = hasCoords
        ? applyJitter(rawLat, rawLng, coordCounts)
        : { jLat: rawLat, jLng: rawLng };

    const price = Number(v.pago_monto || 0);

    return {
        id:          v.id,
        title:       sanitize(v.titulo        || T.UNTITLED),
        business,
        businessLogo,
        isVerified,
        rating,
        empresaId:   v.empresa_id || empresa.id || null,
        companyId:   v.empresa_id || empresa.id || null,
        empresa_id:  v.empresa_id || empresa.id || null,
        price,
        priceLabel:  price > 0 ? `$${(price / 1000).toFixed(0)}k` : T.TO_BE_NEGOTIATED,
        type:        v.modalidad     || v.tipo_turno || null,
        turnoId:     v.tipo_turno_id || null,
        scheduleLabel: (() => {
            if (!v.tipo_turno_id) return 'A convenir';
            const turno = TURNOS_PREDEFINIDOS.find(t => t.id === v.tipo_turno_id);
            if (!turno) return 'A convenir';
            return turno.label.split(' (')[0];
        })(),
        esUrgente:   v.es_urgente    ?? false,
        description: sanitize(v.descripcion   || ''),
        date: (() => {
            if (!v.fecha_turno) return 'A convenir';
            const datePart = v.fecha_turno.split(/[T ]/)[0];
            const parts = datePart.split('-');
            if (parts.length !== 3) return 'A convenir';
            const [year, month, day] = parts;
            const dateObj = new Date(year, month - 1, day);
            const weekday  = dateObj.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '').toUpperCase();
            const monthName = dateObj.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '').toUpperCase();
            return `${weekday} ${parseInt(day)} ${monthName}`;
        })(),
        category:    inferCategory(v),
        tags:        (v.etiquetas     || []).map(sanitize),
        skills:      v.etiquetas      || [],  // uses actual DB column 'etiquetas' (was wrongly mapped to skill_ids)
        address:     v.direccion_formateada || T.PROTECTED_LOCATION,
        hasCoords,
        isFallback,
        lat:    hasCoords ? jLat   : null,
        lng:    hasCoords ? jLng   : null,
        rawLat: hasCoords ? rawLat : null,
        rawLng: hasCoords ? rawLng : null,
    };
};

/**
 * Normalizes a raw application (postulación) object into a clean UI-ready DTO.
 */
export const normalizeApplication = (app) => {
    const T = UI_STRINGS.VACANCY;
    const v = app.vacante || {};
    const eRaw = v.empresas || v.empresa || {};
    const e = Array.isArray(eRaw) ? (eRaw[0] || {}) : eRaw;
    const dateObj = v.fecha_turno ? new Date(v.fecha_turno) : new Date(app.created_at);
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();
    
    return {
        id: app.id,
        applicationId: app.id,
        vacanteId: v.id,
        status: app.status,
        vacancyStatus: v.status || null,
        protocolState: app.protocol_state || {},
        dateDisplay: isToday ? T.TODAY : dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }).toUpperCase(),
        fullDate: dateObj.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short' }),
        time: T.BY_CONFIRMING,
        price: v.pago_monto || 0,
        role: v.titulo || T.UNTITLED,
        company: e.nombre_comercial || T.CONFIDENTIAL_COMPANY,
        companyId: e.id,
        companyLogo: e.logo_url || e.avatar_url || e.avatar || e.foto || null,
        address: v.direccion_formateada || T.BY_CONFIRMING,
        city: 'Ciudad',
        category: v.categoria || 'Otros',
        type: v.tipo_turno || 'ocasional'
    };
};
