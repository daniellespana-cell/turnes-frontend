import { PLANS_CONFIG } from '../context/authConstants';

/**
 * 👤 PROFILE MAPPER
 * SSOT (Single Source of Truth) para la normalización de datos de usuario.
 * Centraliza la lógica de mapeo entre Supabase (DB/JWT) y el Estado de React (UI).
 */
export const profileMapper = {

    /**
     * Normaliza los datos provenientes de DB o JWT a un objeto de usuario estándar.
     * @param {Object} profileData - Datos de la tabla 'perfiles'
     * @param {Object} sessionUser - Datos de auth.user() (JWT)
     */
    normalize(profileData, sessionUser) {
        if (!profileData && !sessionUser) return null;

        // 🛡️ ZERO TRUST & FAST FCP: Leemos el rol desde los Custom Claims criptográficos
        const jwtRole = sessionUser?.app_metadata?.rol;
        const currentRole = profileData?.rol || jwtRole || sessionUser?.user_metadata?.rol || 'postulante';

        // 🏗️ CONSTRUCCIÓN DEL OBJETO BASE
        const base = {
            id: profileData?.id || sessionUser?.id,
            email: sessionUser?.email || profileData?.email,
            role: currentRole,
            rol: currentRole, // Compatibilidad DB
            name: profileData?.nombre_display || profileData?.full_name || sessionUser?.user_metadata?.full_name || sessionUser?.email?.split('@')[0] || 'Usuario',
            avatar_url: profileData?.avatar_url || profileData?.empresas?.logo_url || sessionUser?.user_metadata?.avatar_url || null,

            // 📊 REPUTACIÓN (SSOT del Backend)
            reputation: {
                score: Number(profileData?.reputation_score || 0),
                count: Number(profileData?.reputation_count || 0),
            },

            // 🛡️ SECURITY & HYDRATION
            created_at: sessionUser?.created_at || profileData?.created_at,
            // ⚡ HYDRATION BOTTLENECK REMOVED: Si el JWT ya trae el rol, renderizamos de inmediato
            is_hydrated: !!profileData || !!jwtRole,
            needs_onboarding: currentRole === 'pendiente',
        };

        // 🚀 LÓGICA DE PLANES (Solo para Empresas)
        let planDetails = {};
        if (currentRole === 'empresa') {
            const dbPlanSlug = (profileData?.plan || 'Básico').toLowerCase();
            let matchedKey = Object.keys(PLANS_CONFIG).find(
                key => key.toLowerCase() === dbPlanSlug || (key.toLowerCase() === 'básico' && dbPlanSlug === 'basic')
            ) || 'Básico';

            const planConfig = PLANS_CONFIG[matchedKey];
            const currentPlanId = matchedKey.toLowerCase() === 'básico' ? 'basic' : matchedKey.toLowerCase();

            planDetails = {
                plan: currentPlanId,
                planName: planConfig.name,
                planId: currentPlanId,
                commission: planConfig.commission,
                fixedJobCost: planConfig.fixedJobCost,
                planFeatures: planConfig.features
            };
        }

        // 📦 MERGE FINAL
        return {
            ...base,
            ...profileData, // Preservar campos extra (bio, skills, etc)
            ...planDetails,
            saldo: profileData?.saldo || 0,
        };
    },

    /**
     * Filtra datos sensibles (DLP) para evitar fuga de plataforma (correos y teléfonos).
     */
    sanitizeDLP(text) {
        if (!text || typeof text !== 'string') return text;
        
        let sanitized = text;

        // 1. Enmascarar correos electrónicos
        sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[CORREO PROTEGIDO]');
        
        // 2. Enmascarar números de teléfono (detecta 10 dígitos con o sin prefijo +57, espacios, guiones)
        // Ejemplo: 3105555555, 310 555 5555, 310-555-5555, +57 310 555 5555
        sanitized = sanitized.replace(/(?:\+?57[\s-]?)?(?:3\d{2}[\s-]?\d{3}[\s-]?\d{4})/g, '[TELÉFONO PROTEGIDO]');
        
        // 3. Enmascarar palabras clave sospechosas
        sanitized = sanitized.replace(/(?:whatsapp|wa\.me|celular|cel:|llámame al|escríbeme al|mi numero es)/gi, '[CONTACTO PROTEGIDO]');
        
        return sanitized;
    },

    /**
     * Mapea actualizaciones de la UI a los nombres de columna de la DB.
     * @param {Object} uiUpdates - Datos desde formularios de React
     */
    mapUIToDB(uiUpdates) {
        const dbPayload = {};

        const mapping = {
            name:            'nombre_display',
            phone:           'telefono',
            company:         'nombre_empresa',   // columna en perfiles
            address:         'direccion',
            location:        'direccion',         // alias — no genera duplicado porque JS sobrescribe la key
            avatar:          'avatar_url',
            nit:             'nit',               // perfiles.nit (no confundir con empresas.nit_rut)
            bio:             'bio',
            skills:          'skills',
            sector:          'sector',
            availability:    'disponibilidad',
            experienceYears: 'experiencia_anios',
            plan:            'plan',
            configuraciones: 'configuraciones'
        };

        const dlpFields = ['nombre_display', 'nombre_empresa', 'bio'];

        Object.keys(uiUpdates).forEach(key => {
            if (mapping[key]) {
                let value = uiUpdates[key];

                // Aplicar escudo DLP en campos susceptibles de fuga
                if (dlpFields.includes(mapping[key]) && typeof value === 'string') {
                    value = profileMapper.sanitizeDLP(value);
                }

                // Validar que las habilidades personalizadas no escondan números
                if (mapping[key] === 'skills' && Array.isArray(value)) {
                    value = value.map(skill => typeof skill === 'string' ? profileMapper.sanitizeDLP(skill) : skill);
                }

                dbPayload[mapping[key]] = value;
            }
        });

        // 🌍 Manejo de Coordenadas (Soporta nulos explícitos)
        const lat = uiUpdates.lat !== undefined ? uiUpdates.lat : (uiUpdates.location?.lat ?? uiUpdates.coords?.lat);
        const lng = uiUpdates.lng !== undefined ? uiUpdates.lng : (uiUpdates.location?.lng ?? uiUpdates.coords?.lng);
        
        if (lat !== undefined) dbPayload.lat = lat;
        if (lng !== undefined) dbPayload.lng = lng;

        return dbPayload;
    }
};
