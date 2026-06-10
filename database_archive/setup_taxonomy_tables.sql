-- ============================================================
-- 🧠 TURNES TAXONOMY — DB Tables (Single Source of Truth)
-- ============================================================
-- Crea las 3 tablas relacionales que alimentan al motor dinámico
-- de vacantes.taxonomy.js via syncTaxonomyWithDB().
-- Ejecutar en Supabase SQL Editor. Idempotente.
-- ============================================================

-- ── TABLA 1: Sectores ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS taxonomy_sectors (
    id          TEXT PRIMARY KEY,       -- 'GASTRO', 'COMERCIAL', etc.
    label       TEXT NOT NULL,
    description TEXT,
    icon        TEXT DEFAULT 'Grid',
    color       TEXT DEFAULT 'text-zinc-500',
    hex         TEXT DEFAULT '#71717a',
    sort_order  INTEGER DEFAULT 99,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existía sin estas columnas, las agregamos:
ALTER TABLE taxonomy_sectors ADD COLUMN IF NOT EXISTS icon       TEXT DEFAULT 'Grid';
ALTER TABLE taxonomy_sectors ADD COLUMN IF NOT EXISTS color      TEXT DEFAULT 'text-zinc-500';
ALTER TABLE taxonomy_sectors ADD COLUMN IF NOT EXISTS hex        TEXT DEFAULT '#71717a';
ALTER TABLE taxonomy_sectors ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 99;
ALTER TABLE taxonomy_sectors ADD COLUMN IF NOT EXISTS is_active  BOOLEAN DEFAULT true;
ALTER TABLE taxonomy_sectors ADD COLUMN IF NOT EXISTS description TEXT;

-- ── TABLA 2: Roles ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS taxonomy_roles (
    id                   TEXT PRIMARY KEY,   -- 'MESERO', 'VENDEDOR_TAT', etc.
    sector_id            TEXT NOT NULL REFERENCES taxonomy_sectors(id) ON DELETE CASCADE,
    label                TEXT NOT NULL,
    slug                 TEXT,               -- para URLs amigables
    sort_order           INTEGER DEFAULT 99,
    is_active            BOOLEAN DEFAULT true,
    -- Marketing (para landing pages)
    marketing_title      TEXT,
    marketing_accent_color TEXT,
    marketing_description TEXT,
    job_demo_title       TEXT,
    job_demo_salary      TEXT,
    job_demo_location    TEXT,
    job_demo_hours       TEXT,
    job_demo_reqs        JSONB,
    created_at           TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_roles_sector ON taxonomy_roles (sector_id);
CREATE INDEX IF NOT EXISTS idx_roles_slug   ON taxonomy_roles (slug);

-- ── TABLA 3: Skills / Requisitos ─────────────────────────────
CREATE TABLE IF NOT EXISTS taxonomy_skills (
    id          TEXT PRIMARY KEY,
    sector_id   TEXT NOT NULL REFERENCES taxonomy_sectors(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    sort_order  INTEGER DEFAULT 99,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_skills_sector ON taxonomy_skills (sector_id);

-- ── RLS: Solo lectura pública ─────────────────────────────────
ALTER TABLE taxonomy_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_roles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_skills  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "taxonomy_public_read" ON taxonomy_sectors;
DROP POLICY IF EXISTS "taxonomy_public_read" ON taxonomy_roles;
DROP POLICY IF EXISTS "taxonomy_public_read" ON taxonomy_skills;

CREATE POLICY "taxonomy_public_read" ON taxonomy_sectors FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON taxonomy_roles   FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON taxonomy_skills  FOR SELECT USING (true);


-- ═══════════════════════════════════════
-- DATOS: SECTORES
-- ═══════════════════════════════════════
INSERT INTO taxonomy_sectors (id, label, description, icon, color, hex, sort_order) VALUES
('GASTRO',       'Gastronomía y Bares 🍔',         'Velocidad y técnica. Sector de alta rotación.',                   'Utensils',    'text-orange-500', '#f97316', 1),
('COMERCIAL',    'Ventas y Comercial 💼',           'Impulsadores, promotores, ventas TAT. Alta demanda nacional.',    'TrendingUp',  'text-green-500',  '#22c55e', 2),
('LOGISTICA',    'Logística y Carga 📦',            'Bodegas, mudanzas y organización.',                               'Truck',       'text-blue-500',   '#3b82f6', 3),
('CONSTRUCCION', 'Construcción y Mantenimiento 🏗️', 'Fuerza física o conocimientos técnicos puntuales.',               'Hammer',      'text-amber-500',  '#f59e0b', 4),
('TRANSPORTE',   'Transporte y Movilidad 🚗',       'Conductores, taxistas y operarios de plataformas.',               'Car',         'text-zinc-400',   '#a1a1aa', 5),
('EVENTOS',      'Eventos y Entretenimiento 🎉',    'Imagen y servicio al cliente.',                                   'Music',       'text-indigo-500', '#6366f1', 6),
('BELLEZA',      'Belleza y Estética 💅',           'Talento técnico probado.',                                        'Scissors',    'text-pink-500',   '#ec4899', 7),
('SALUD_CUIDADO','Salud y Cuidado de Personas 🩺',  'Asistencia profesional y cuidado humano.',                        'Heart',       'text-rose-500',   '#f43f5e', 8),
('HOGAR',        'Hogar y Limpieza 🧹',             'Servicios domésticos de confianza.',                              'Home',        'text-purple-500', '#a855f7', 9),
('MANUFACTURA',  'Manufactura e Industria 🏭',      'Operarios de línea, ensamble y producción.',                      'Factory',     'text-cyan-500',   '#06b6d4', 10),
('CALL_CENTER',  'Call Center y BPO 🎧',            'Agentes de servicio, ventas telefónicas y soporte.',              'Phone',       'text-sky-500',    '#0ea5e9', 11),
('SEGURIDAD',    'Seguridad y Vigilancia 🛡️',       'Celadores, vigilantes y guardas de seguridad.',                   'Shield',     'text-slate-400',  '#94a3b8', 12),
('ASEO_EMP',     'Aseo Empresarial 🧽',             'Aseadoras de oficinas, centros comerciales y hospitales.',        'Sparkles',    'text-teal-500',   '#14b8a6', 13),
('TECNOLOGIA',   'Tecnología y Sistemas 💻',        'Técnicos en redes, soporte IT y mantenimiento de equipos.',       'Monitor',     'text-violet-500', '#8b5cf6', 14),
('EDUCACION',    'Educación y Capacitación 📚',     'Docentes de reemplazo, tutores y monitores.',                     'BookOpen',    'text-yellow-500', '#eab308', 15),
('AGRO',         'Agro y Campo 🚜',                 'Trabajo rural por rendimiento.',                                  'Leaf',        'text-emerald-500','#10b981', 16)
ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, description=EXCLUDED.description,
    icon=EXCLUDED.icon, color=EXCLUDED.color, hex=EXCLUDED.hex, sort_order=EXCLUDED.sort_order;


-- ═══════════════════════════════════════
-- DATOS: ROLES
-- ═══════════════════════════════════════
INSERT INTO taxonomy_roles (id, sector_id, label, slug, sort_order) VALUES
-- GASTRONOMÍA
('MESERO',       'GASTRO', 'Mesero / Camarero',            'mesero',    1),
('LAVAPLATOS',   'GASTRO', 'Lavaplatos / Steward',         NULL,        2),
('AYU_COCINA',   'GASTRO', 'Ayudante de Cocina',           'ayudante',  3),
('PARRILLERO',   'GASTRO', 'Parrillero / Asador',          'cocinero',  4),
('BARTENDER',    'GASTRO', 'Bartender / Barman',           'bartender', 5),
('BARISTA',      'GASTRO', 'Barista Profesional',          'barista',   6),
('REPOSTERO',    'GASTRO', 'Repostero / Pastelero',        'reposteria',7),
('PANADERO',     'GASTRO', 'Panadero',                     NULL,        8),
('COCINERO',     'GASTRO', 'Cocinero (General)',           NULL,        9),
('COMIDA_RAPIDA','GASTRO', 'Operario de Comida Rápida',    NULL,        10),
('PIZZERO',      'GASTRO', 'Pizzero / Hornero',            NULL,        11),
('DOMICILIARIO', 'GASTRO', 'Domiciliario (Moto/Bici)',     NULL,        12),
('CAJERO_REST',  'GASTRO', 'Cajero de Restaurante',        NULL,        13),
-- COMERCIAL
('VENDEDOR_TAT', 'COMERCIAL', 'Vendedor TAT / Canal Tradicional', 'vendedor', 1),
('IMPULSOR',     'COMERCIAL', 'Impulsor / Promotor de Marca',     'impulsor', 2),
('ASESOR_VENTAS','COMERCIAL', 'Asesor Comercial en Punto de Venta','asesor',  3),
('MERCADERISTA', 'COMERCIAL', 'Mercaderista',                      NULL,      4),
('CAJERO',       'COMERCIAL', 'Cajero / Operador de Caja',         'cajero',  5),
('INVENTARIOS',  'COMERCIAL', 'Auxiliar de Inventarios',           NULL,      6),
-- LOGÍSTICA
('COTERO',       'LOGISTICA', 'Cotero / Cargue y Descargue',      NULL,        1),
('BODEGUERO',    'LOGISTICA', 'Auxiliar de Bodega',               NULL,        2),
('EMPACADOR',    'LOGISTICA', 'Empacador / Picking',              NULL,        3),
('AUX_CAMION',   'LOGISTICA', 'Auxiliar de Ruta / Camión',        NULL,        4),
('MENSAJERO',    'LOGISTICA', 'Mensajero en Moto',                NULL,        5),
('MONTACARGAS',  'LOGISTICA', 'Operador de Montacargas',          NULL,        6),
('VERIFICADOR',  'LOGISTICA', 'Verificador / Inspector',          NULL,        7),
-- CONSTRUCCIÓN
('AYU_OBRA',     'CONSTRUCCION', 'Ayudante de Obra',              NULL, 1),
('OFICIAL',      'CONSTRUCCION', 'Oficial de Obra',               NULL, 2),
('PINTOR',       'CONSTRUCCION', 'Pintor / Estucador',            NULL, 3),
('TODERO',       'CONSTRUCCION', 'Todero (Reparaciones Locativas)',NULL, 4),
('ELECTRICISTA', 'CONSTRUCCION', 'Electricista Básico',           NULL, 5),
('PLOMERO',      'CONSTRUCCION', 'Plomero / Fontanero',           NULL, 6),
('SOLDADOR',     'CONSTRUCCION', 'Soldador',                      NULL, 7),
('INST_PISOS',   'CONSTRUCCION', 'Instalador de Pisos / Cerámicas',NULL,8),
-- TRANSPORTE
('CONDUCTOR',    'TRANSPORTE', 'Conductor / Chofer',              NULL, 1),
('TAXISTA',      'TRANSPORTE', 'Taxista Profesional',             NULL, 2),
('CONDUCTOR_APPS','TRANSPORTE','Conductor Plataformas (Rappi/Uber)',NULL,3),
('COND_ESCOLAR', 'TRANSPORTE', 'Conductor Escolar',               NULL, 4),
('LAVADOR_VEHICULOS', 'TRANSPORTE', 'Lavador de Carros / Motos',  NULL, 5),
('MECANICO',     'TRANSPORTE', 'Mecánico de Carro / Moto',        NULL, 6),
('LATONERO',     'TRANSPORTE', 'Pintor de Latonería',             NULL, 7),
-- EVENTOS
('LOGISTICA_EV', 'EVENTOS', 'Logística de Eventos',              NULL, 1),
('BOUNCER',      'EVENTOS', 'Seguridad / Bouncer',               NULL, 2),
('PROTOCOLO_EV', 'EVENTOS', 'Modelo de Protocolo / Azafata',     NULL, 3),
('ANIMADOR',     'EVENTOS', 'Animador / Recreacionista',         NULL, 4),
('FOTOGRAFO_EV', 'EVENTOS', 'Fotógrafo de Eventos',              NULL, 5),
('DJ',           'EVENTOS', 'DJ / Operador de Sonido',           NULL, 6),
-- BELLEZA
('MANICURISTA',  'BELLEZA', 'Manicurista',                       NULL, 1),
('ESTILISTA',    'BELLEZA', 'Estilista / Peluquero(a)',          NULL, 2),
('BARBERO',      'BELLEZA', 'Barbero',                           NULL, 3),
('AUX_PELEQUERIA','BELLEZA','Auxiliar de Peluquería',            NULL, 4),
('PEDICURISTA',  'BELLEZA', 'Pedicurista',                       NULL, 5),
('MAQUILLADORA', 'BELLEZA', 'Maquilladora Profesional',          NULL, 6),
('DEPILADORA',   'BELLEZA', 'Depiladora / Esteticista',          NULL, 7),
-- SALUD Y CUIDADO
('ENFERMERA',    'SALUD_CUIDADO', 'Enfermera(o) Domiciliaria',   NULL, 1),
('CUIDADOR_AM',  'SALUD_CUIDADO', 'Cuidador de Adulto Mayor',    NULL, 2),
('NINERA',       'SALUD_CUIDADO', 'Niñera / Babysitter',         NULL, 3),
('TERAPEUTA',    'SALUD_CUIDADO', 'Terapeuta Física / Respiratoria',NULL,4),
('REGENTE_FARM', 'SALUD_CUIDADO', 'Regente de Farmacia',         NULL, 5),
-- HOGAR
('ASEO_DIAS',    'HOGAR', 'Empleada por días (Aseo General)',    NULL, 1),
('COCINERA_DOM', 'HOGAR', 'Cocinera Doméstica',                  NULL, 2),
('LAVADO_PLANCH','HOGAR', 'Experta en Lavado y Planchado',       NULL, 3),
('JARDINERO',    'HOGAR', 'Jardinero',                           NULL, 4),
('CUIDADO_MASCOTA','HOGAR','Cuidador de Mascotas',               NULL, 5),
-- MANUFACTURA
('OPERARIO_LINEA','MANUFACTURA','Operario de Línea de Producción',NULL,1),
('ENSAMBLADOR',  'MANUFACTURA', 'Ensamblador',                   NULL, 2),
('CALIDAD',      'MANUFACTURA', 'Inspector de Calidad',          NULL, 3),
('MAQUI_COSTURA','MANUFACTURA', 'Maquinista de Confección',      NULL, 4),
('OPERARIO_CNC', 'MANUFACTURA', 'Operario CNC / Torno',          NULL, 5),
-- CALL CENTER
('AGENTE_CALL',  'CALL_CENTER', 'Agente de Call Center',         NULL, 1),
('AGENTE_VENTAS_TEL','CALL_CENTER','Asesor de Ventas Telefónicas',NULL,2),
('SOPORTE_TEC',  'CALL_CENTER', 'Agente Soporte Técnico',        NULL, 3),
('BACK_OFFICE',  'CALL_CENTER', 'Digitador / Back Office',       NULL, 4),
-- SEGURIDAD
('VIGILANTE',    'SEGURIDAD', 'Vigilante / Celador',             NULL, 1),
('GUARDIA_CORP', 'SEGURIDAD', 'Guardia de Seguridad Corporativa',NULL, 2),
('ESCOLTA',      'SEGURIDAD', 'Escolta',                         NULL, 3),
-- ASEO EMPRESARIAL
('ASEADORA',     'ASEO_EMP', 'Aseadora de Oficinas',             NULL, 1),
('ASEADORA_HOSP','ASEO_EMP', 'Aseadora de Clínica / Hospital',   NULL, 2),
('OPERARIO_ASEO','ASEO_EMP', 'Operario de Servicios Generales',  NULL, 3),
-- TECNOLOGÍA
('TEC_SISTEMAS', 'TECNOLOGIA', 'Técnico en Sistemas',            NULL, 1),
('TEC_REDES',    'TECNOLOGIA', 'Técnico en Redes',               NULL, 2),
('SOPORTE_IT',   'TECNOLOGIA', 'Soporte Técnico IT',             NULL, 3),
('TEC_CCTV',     'TECNOLOGIA', 'Técnico CCTV / Alarmas',         NULL, 4),
-- EDUCACIÓN
('DOCENTE_REMP', 'EDUCACION', 'Docente de Reemplazo',            NULL, 1),
('TUTOR',        'EDUCACION', 'Tutor Académico',                 NULL, 2),
('MONITOR',      'EDUCACION', 'Monitor / Instructor',            NULL, 3),
-- AGRO
('RECOLECTOR',   'AGRO', 'Recolector (Cosecha)',                 NULL, 1),
('JORNALERO',    'AGRO', 'Jornalero (Machete/Azadón)',           NULL, 2),
('GALPONERO',    'AGRO', 'Galponero (Avícola/Porcícola)',        NULL, 3),
('MAYORDOMO',    'AGRO', 'Mayordomo / Casero (Reemplazos)',      NULL, 4)
ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, sector_id=EXCLUDED.sector_id, slug=EXCLUDED.slug;


-- ═══════════════════════════════════════
-- DATOS: SKILLS
-- ═══════════════════════════════════════
INSERT INTO taxonomy_skills (id, sector_id, label, sort_order) VALUES
-- GASTRONOMÍA
('MANIPULACION', 'GASTRO', 'Curso Manipulación Alimentos (Vigente)', 1),
('COCTELERIA',   'GASTRO', 'Experiencia en Coctelería',              2),
('PROTOCOLO_SK', 'GASTRO', 'Protocolo de Mesa y Etiqueta',           3),
('BARISMO',      'GASTRO', 'Manejo Máquina de Café (Básico)',         4),
('MOTO_PROPIA',  'GASTRO', 'Vehículo Propio + Papeles al día',        5),
-- COMERCIAL
('MANEJO_NUMEROS','COMERCIAL','Manejo de Planillas y Cuadres de Caja',1),
('CONOCE_BARRIOS','COMERCIAL','Conocimiento de Rutas Urbanas',        2),
('EXP_VENTAS',   'COMERCIAL', 'Experiencia en Ventas (min 6 meses)', 3),
('MOTO_COM',     'COMERCIAL', 'Moto Propia + SOAT Vigente',           4),
-- LOGÍSTICA
('FUERZA',       'LOGISTICA', 'Aptitud para Carga Pesada',           1),
('INV_BASICO',   'LOGISTICA', 'Manejo Básico de Inventarios',        2),
('ESTIBADORA',   'LOGISTICA', 'Manejo de Zorra / Estibadora Manual', 3),
('UBICACION',    'LOGISTICA', 'Conocimiento de Nomenclatura Urbana', 4),
('MONTACARGAS_LIC','LOGISTICA','Licencia de Montacargas',            5),
-- CONSTRUCCIÓN
('ALTURAS',      'CONSTRUCCION','Curso de Alturas (Vigente)',        1),
('HERRAMIENTA',  'CONSTRUCCION','Cuenta con Herramienta Propia',     2),
('MATRICULA_EL', 'CONSTRUCCION','Matrícula CONTE (Electricidad)',     3),
('OBRA_BLANCA',  'CONSTRUCCION','Experiencia en Obra Blanca/Acabados',4),
('SOLDADURA',    'CONSTRUCCION','Certificado de Soldadura',           5),
-- TRANSPORTE
('LICENCIA_C2',  'TRANSPORTE', 'Licencia de Conducción B1/C2/C3 Vigente',1),
('AUTO_PROPIO',  'TRANSPORTE', 'Vehículo Propio (Papeles al día)',    2),
('GPS_SK',       'TRANSPORTE', 'Excelente Manejo de GPS (Waze/Maps)', 3),
('MECANICA_SK',  'TRANSPORTE', 'Conocimientos Básicos de Mecánica',  4),
-- EVENTOS
('PRESENCIA',    'EVENTOS', 'Excelente Presentación Personal',       1),
('INGLES_EV',    'EVENTOS', 'Inglés Conversacional (Básico/Intermedio)',2),
('ATENCION_VIP', 'EVENTOS', 'Experiencia en Atención VIP',           3),
('SONIDO_SK',    'EVENTOS', 'Montaje Básico de Sonido/Luces',         4),
-- BELLEZA
('SISTEMAS_U',   'BELLEZA', 'Sistemas (Acrílico/Gel/Semi)',          1),
('COLOR',        'BELLEZA', 'Colorimetría y Tintes',                 2),
('FADE',         'BELLEZA', 'Desvanecidos (Barbería Moderna)',        3),
('KIT_PROPIO',   'BELLEZA', 'Cuenta con Maleta/Insumos Propios',     4),
-- SALUD Y CUIDADO
('RETHUS',       'SALUD_CUIDADO','Registro RETHUS (Salud)',          1),
('PRIMEROS_AUX', 'SALUD_CUIDADO','Curso Primeros Auxilios (Vigente)',2),
('INYECTOLOGIA', 'SALUD_CUIDADO','Certificado de Inyectología',      3),
('GERIATRIA',    'SALUD_CUIDADO','Experiencia con Pacientes Postrados',4),
('PEDAGOGIA',    'SALUD_CUIDADO','Conocimientos Pedagógicos (Niños)',5),
-- HOGAR
('COCINA_CRIOLLA','HOGAR','Cocina Criolla Colombiana',               1),
('LIMPIEZA_PRO', 'HOGAR', 'Técnicas de Limpieza Profunda',           2),
('REFERENCIAS',  'HOGAR', 'Referencias Laborales Verificables',      3),
('MASCOTAS',     'HOGAR', 'Afinidad con Mascotas (Perros/Gatos)',    4),
-- MANUFACTURA
('NORMAS_CALIDAD','MANUFACTURA','Conocimiento ISO/Normas de Calidad',1),
('MAQUINARIA',   'MANUFACTURA','Operación de Maquinaria Industrial', 2),
('CONFECCION',   'MANUFACTURA','Experiencia en Confección Textil',   3),
-- CALL CENTER
('DICCION',      'CALL_CENTER','Excelente Dicción y Comunicación',   1),
('DIGITACION',   'CALL_CENTER','Velocidad de Digitación (min 40wpm)',2),
('EXP_CRM',      'CALL_CENTER','Manejo de CRM (Salesforce/Zendesk)', 3),
-- SEGURIDAD
('VIGILANTE_LIC','SEGURIDAD','Curso SuperVigilancia Vigente',        1),
('ARMAS',        'SEGURIDAD','Permiso de Armas (Porte)',             2),
('PRIMEROS_SEG', 'SEGURIDAD','Primeros Auxilios Básicos',            3),
-- ASEO EMPRESARIAL
('QUIMICOS',     'ASEO_EMP','Manejo de Productos Químicos de Limpieza',1),
('MAQUINAS_ASEO','ASEO_EMP','Operación de Máquinas de Limpieza Industrial',2),
-- TECNOLOGÍA
('REDES_BASICA', 'TECNOLOGIA','Certificado en Redes (CCNA/CompTIA)', 1),
('MANTENIMIENTO','TECNOLOGIA','Mantenimiento de Equipos de Cómputo', 2),
('CCTV_SK',      'TECNOLOGIA','Instalación de Cámaras y Alarmas',    3),
-- EDUCACIÓN
('LICENCIADO',   'EDUCACION','Licenciado o Normalista Superior',     1),
('EXP_DOCENTE',  'EDUCACION','Experiencia Docente Verificable',      2),
-- AGRO
('GUADANA',      'AGRO','Manejo de Guadaña',                         1),
('CAFE',         'AGRO','Experiencia Recolección Café',              2),
('CARGA_AGRO',   'AGRO','Carga de Bultos Agrícolas',                 3),
('ANIMALES',     'AGRO','Cuidado de Animales de Granja',             4)
ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, sector_id=EXCLUDED.sector_id;

-- ── VERIFICACIÓN ─────────────────────────────────────────────
SELECT 'Sectores' AS tabla, COUNT(*) AS total FROM taxonomy_sectors WHERE is_active
UNION ALL
SELECT 'Roles',   COUNT(*) FROM taxonomy_roles   WHERE is_active
UNION ALL
SELECT 'Skills',  COUNT(*) FROM taxonomy_skills  WHERE is_active;
