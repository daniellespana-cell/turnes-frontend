import { UI_STRINGS } from './uiTranslations';

const P = UI_STRINGS.PROFILE;

/**
 * Normaliza un perfil de candidato desde la BD.
 */
export const normalizeCandidateProfile = (raw) => {
    if (!raw) return null;
    const avatarUrl = raw.avatar_url || raw.avatar || null;
    return {
        id: raw.id,
        nombre_display: raw.nombre_display || raw.name || P.DEFAULT_NAME,
        // Exponer el avatar en ambas llaves para tolerancia de consumidores distintos
        avatar_url: avatarUrl,
        avatar: avatarUrl,
        role: raw.skills?.[0] || raw.titulo_profesional || raw.rol || P.DEFAULT_ROLE,
        // 🛡️ REFUERZO SSOT: La base de datos manda
        rating: Number(raw.reputation_score ?? raw.rating ?? raw.calificacion ?? 0).toFixed(1),
        reviewsCount: raw.reputation_count ?? 0,
        exitos: raw.completed_shifts ?? raw.exitos ?? 0,
        verified: raw.verificado || raw.verified || false,
        bio: raw.bio || P.NO_BIO,
        skills: raw.skills || []
    };
};

/**
 * Normaliza un perfil de empresa desde la BD.
 */
export const normalizeCompanyProfile = (raw) => {
    if (!raw) return null;
    return {
        id: raw.id,
        name: raw.nombre_comercial || raw.name || raw.companyName || P.DEFAULT_COMPANY,
        logo: raw.logo_url || raw.companyLogo || raw.avatar || raw.foto || null,
        verified: raw.verificado || raw.verified || false,
        sector: raw.sector_industrial || raw.sector || null
    };
};

/**
 * Normaliza el contexto de un chat combinando vacante, empresa y candidato.
 */
export const normalizeChatContext = (data, companyData = null) => {
    if (!data) return null;
    
    let companyName = P.DEFAULT_COMPANY;
    let companyLogo = null;
    
    if (companyData) {
        const company = normalizeCompanyProfile(companyData);
        if (company) {
            companyName = company.name;
            companyLogo = company.logo;
        }
    } else if (data.vacante?.empresas) {
        const company = normalizeCompanyProfile(data.vacante.empresas);
        if (company) {
            companyName = company.name;
            companyLogo = company.logo;
        }
    }

    const candidate = normalizeCandidateProfile(data.candidato);
    const candidateName = candidate?.nombre_display || P.DEFAULT_CANDIDATE;
    // 🐛 BUG FIX: ahora `normalizeCandidateProfile` expone `avatar_url` Y `avatar`.
    const candidateAvatar = candidate?.avatar_url || null;

    return {
        id: data.id,
        status: data.status,
        vacante: data.vacante,
        company: companyName,
        companyLogo: companyLogo, 
        companyAvatar: companyLogo,
        candidate: candidateName,
        candidateAvatar: candidateAvatar,
        // Aliases en ambas llaves para tolerancia de componentes con distintas expectativas
        avatar: candidateAvatar,
        avatar_url: candidateAvatar,
        companyId: data.vacante?.empresa_id || data.companyId,
        candidateId: candidate?.id || data.candidateId,
        payment: data.vacante?.pago_monto || data.payment,
        role: data.vacante?.titulo || data.role,
        roleContext: data.roleContext || data.vacante?.titulo
    };
};
