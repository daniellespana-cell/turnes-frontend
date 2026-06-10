-- ==============================================================================
-- 🚀 TURNES TAXONOMY CEREBRO - SQL SCHEMA & SEEDER
-- Convierte la taxonomía Hardcodeada de JS a un modelo Relacional Dinámico.
-- ==============================================================================

-- 1. CREACIÓN DE TABLAS
-- ==============================================================================

-- Tabla Padre: SECTORES
CREATE TABLE IF NOT EXISTS public.taxonomy_sectors (
    id VARCHAR(50) PRIMARY KEY, -- ej 'GASTRO'
    label VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Hija 1: ROLES (Cargos)
CREATE TABLE IF NOT EXISTS public.taxonomy_roles (
    id VARCHAR(50) PRIMARY KEY, -- ej 'MESERO'
    sector_id VARCHAR(50) REFERENCES public.taxonomy_sectors(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    marketing_title VARCHAR(150),
    marketing_accent_color VARCHAR(50),
    marketing_description TEXT,
    job_demo_title VARCHAR(150),
    job_demo_salary VARCHAR(100),
    job_demo_location VARCHAR(150),
    job_demo_hours VARCHAR(50),
    job_demo_reqs JSONB, -- Array de requisitos en texto
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Hija 2: SKILLS (Habilidades/Requisitos Opcionales)
CREATE TABLE IF NOT EXISTS public.taxonomy_skills (
    id VARCHAR(50) PRIMARY KEY, -- ej 'MANIPULACION'
    sector_id VARCHAR(50) REFERENCES public.taxonomy_sectors(id) ON DELETE CASCADE,
    label VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. SEGURIDAD RLS (Row Level Security)
-- ==============================================================================
-- Todo es de lectura pública (cualquiera debe poder ver el buscador sin login)
-- Pero la escritura/edición está estrictamente reservada a superusuarios (service_role / panel web).

ALTER TABLE public.taxonomy_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_skills ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (SELECT)
CREATE POLICY "Taxonomy Sectors are viewable by everyone." 
ON public.taxonomy_sectors FOR SELECT USING (true);

CREATE POLICY "Taxonomy Roles are viewable by everyone." 
ON public.taxonomy_roles FOR SELECT USING (true);

CREATE POLICY "Taxonomy Skills are viewable by everyone." 
ON public.taxonomy_skills FOR SELECT USING (true);


-- 3. POBLADO DE DATOS (SEEDING INICIAL)
-- ==============================================================================
-- Mueve el Cerebro JS actual a Postgres.

-- ----------------- SECTORES -----------------
INSERT INTO public.taxonomy_sectors (id, label, description, sort_order) VALUES
('GASTRO', 'Gastronomía y Bares 🍔', 'Velocidad y técnica. Sector de alta rotación.', 10),
('CONSTRUCCION', 'Construcción y Mantenimiento 🏗️', 'Fuerza física o conocimientos técnicos puntuales.', 20),
('LOGISTICA', 'Logística y Carga 📦', 'Bodegas, mudanzas y organización.', 30),
('TRANSPORTE', 'Transporte y Movilidad 🚗', 'Conductores, taxistas y operarios de plataformas.', 40),
('BELLEZA', 'Belleza y Estética 💅', 'Talento técnico probado.', 50),
('CUIDADO', 'Salud y Cuidado de Personas 🩺', 'Asistencia profesional y cuidado humano.', 60),
('HOGAR', 'Hogar y Limpieza 🧹', 'Servicios domésticos de confianza.', 70),
('EVENTOS', 'Eventos y Entretenimiento 🎉', 'Imagen y servicio al cliente.', 80),
('AGRO', 'Agro y Campo 🚜', 'Trabajo rural por rendimiento.', 90)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description;

-- ----------------- GASTRO -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('MANIPULACION', 'GASTRO', 'Curso Manipulación Alimentos (Vigente)', 1),
('COCTELERIA', 'GASTRO', 'Experiencia en Coctelería', 2),
('PROTOCOLO', 'GASTRO', 'Protocolo de Mesa y Etiqueta', 3),
('BARISMO', 'GASTRO', 'Manejo Máquina de Café (Básico)', 4),
('MOTO_PROPIA_GASTRO', 'GASTRO', 'Vehículo Propio + Papeles al día', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, slug, marketing_title, marketing_accent_color, marketing_description, job_demo_title, job_demo_salary, job_demo_location, job_demo_hours, job_demo_reqs, sort_order) VALUES
('MESERO', 'GASTRO', 'Mesero / Camarero', 'mesero', 'Mesero de Protocolo', 'text-orange-400', 'Atención al cliente con energía. Únete a equipos de eventos y restaurantes de alta rotación.', 'Mesero de Protocolo', 'COP 60,000 / hora', 'Cañaveral, Floridablanca', '6 horas', '["Experiencia en mesa", "Excelente presentación", "Curso de manipulación"]', 1),
('LAVAPLATOS', 'GASTRO', 'Lavaplatos / Steward', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2),
('AYU_COCINA', 'GASTRO', 'Ayudante de Cocina', 'ayudante', 'Ayudante de Cocina', 'text-gray-400', 'El soporte vital de cualquier cocina. Aprende y gana dinero en turnos de apoyo.', 'Auxiliar de Cocina', 'COP 50,000 / hora', 'Centro, Bucaramanga', '8 horas', '["Rapidez", "Limpieza", "Disponibilidad inmediata"]', 3),
('PARRILLERO', 'GASTRO', 'Parrillero / Asador', 'cocinero', 'Cocinero Rápido (Línea)', 'text-red-400', 'Trabaja en cocinas dinámicas de Piedecuesta a Girón. Cubre picos de demanda en restaurantes que necesitan tu velocidad y eficiencia.', 'Ayuda de Cocina - Servicio Nocturno', 'COP 70,000 / hora', 'Zona Industrial, Girón', '8 horas', '["Carnet de manipulación de alimentos", "Experiencia en Parrilla", "Trabajo bajo presión"]', 4),
('BARTENDER', 'GASTRO', 'Bartender / Barman', 'bartender', 'Bartender de Eventos', 'text-pink-400', 'Encuentra turnos flexibles para eventos privados y corporativos. Demuestra tu mixología sin ataduras de un contrato fijo.', 'Turno Bartender Nocturno', 'COP 70,000 / hora', 'Zona Rosa, Bucaramanga', '6 horas', '["Conocimiento de coctelería clásica", "Manejo de TPV", "Inglés intermedio"]', 5),
('DOMICILIARIO', 'GASTRO', 'Domiciliario (Moto/Bici)', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6),
('BARISTA', 'GASTRO', 'Barista Profesional', 'barista', 'Barista Profesional', 'text-yellow-400', 'Únete a la comunidad de baristas más solicitada. Turnes te conecta con cafeterías de especialidad que valoran tu arte y pagan por hora.', 'Turno Barista de Mañana', 'COP 70,000 / hora', 'Centro, Bucaramanga', '5 horas', '["Experiencia Latte Art", "Manejo de Tostadora", "Disponibilidad Fines de Semana"]', 7),
('REPOSTERO', 'GASTRO', 'Repostero / Pastelero', 'reposteria', 'Chef de Repostería', 'text-teal-400', 'Los mejores postres requieren el mejor talento. Conecta con pastelerías de alta demanda para turnos especializados.', 'Turno Repostero Fino', 'COP 70,000 / hora', 'Cabecera, Bucaramanga', '4 horas', '["Manejo de masas", "Decoración artística", "Certificado de higiene"]', 8),
('PANADERO', 'GASTRO', 'Panadero', 'panadero', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 9),
('COCINERO', 'GASTRO', 'Cocinero (General)', 'chef', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10),
('COMIDA_RAPIDA', 'GASTRO', 'Operario de Comida Rápida', 'fastfood', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 11),
('PIZZERO', 'GASTRO', 'Pizzero / Hornero', 'pizzero', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 12)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order;

-- ----------------- CONSTRUCCION -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('ALTURAS', 'CONSTRUCCION', 'Curso de Alturas (Vigente)', 1),
('HERRAMIENTA', 'CONSTRUCCION', 'Cuenta con Herramienta Propia', 2),
('MATRICULA_CONTE', 'CONSTRUCCION', 'Matrícula CONTE (Electricidad)', 3),
('OBRA_BLANCA', 'CONSTRUCCION', 'Experiencia en Obra Blanca/Acabados', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('AYU_OBRA', 'CONSTRUCCION', 'Ayudante de Obra', 1),
('OFICIAL', 'CONSTRUCCION', 'Oficial de Obra', 2),
('PINTOR', 'CONSTRUCCION', 'Pintor / Estucador', 3),
('TODERO', 'CONSTRUCCION', 'Todero (Reparaciones Locativas)', 4),
('ELECTRICISTA', 'CONSTRUCCION', 'Electricista Básico', 5),
('PLOMERO', 'CONSTRUCCION', 'Plomero / Fontanero', 6)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- ----------------- LOGISTICA -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('FUERZA', 'LOGISTICA', 'Aptitud para Carga Pesada', 1),
('INVENTARIOS', 'LOGISTICA', 'Manejo Básico de Inventarios', 2),
('ESTIBADORA', 'LOGISTICA', 'Manejo de Zorra / Estibadora Manual', 3),
('UBICACION', 'LOGISTICA', 'Conocimiento de Nomenclatura Urbana', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('COTERO', 'LOGISTICA', 'Cotero / Cargue y Descargue', 1),
('BODEGUERO', 'LOGISTICA', 'Auxiliar de Bodega', 2),
('EMPACADOR', 'LOGISTICA', 'Empacador / Picking', 3),
('AUX_CAMION', 'LOGISTICA', 'Auxiliar de Ruta/Camión', 4)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- ----------------- TRANSPORTE -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('LICENCIA_C2', 'TRANSPORTE', 'Licencia de Conducción B1/C2/C3 Vigente', 1),
('AUTO_PROPIO', 'TRANSPORTE', 'Vehículo Propio (Papeles al día)', 2),
('GPS', 'TRANSPORTE', 'Excelente Manejo de GPS (Waze/Maps)', 3),
('MECANICA', 'TRANSPORTE', 'Conocimientos Básicos de Mecánica', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('CONDUCTOR', 'TRANSPORTE', 'Conductor / Chofer', 1),
('TAXISTA', 'TRANSPORTE', 'Taxista Profesional', 2),
('CONDUCTOR_APPS', 'TRANSPORTE', 'Conductor de Plataformas (Apps)', 3)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- ----------------- BELLEZA -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('SISTEMAS_U', 'BELLEZA', 'Sistemas (Acrílico/Gel/Semi)', 1),
('COLOR', 'BELLEZA', 'Colorimetría y Tintes', 2),
('FADE', 'BELLEZA', 'Desvanecidos (Barbería Moderna)', 3),
('KIT_PROPIO', 'BELLEZA', 'Cuenta con Maleta/Insumos Propios', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('MANICURISTA', 'BELLEZA', 'Manicurista', 1),
('ESTILISTA', 'BELLEZA', 'Estilista / Peluquero(a)', 2),
('BARBERO', 'BELLEZA', 'Barbero', 3),
('AUX_PELUQUERIA', 'BELLEZA', 'Auxiliar de Peluquería', 4)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- ----------------- SALUD Y CUIDADO -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('RETHUS', 'CUIDADO', 'Registro RETHUS (Salud)', 1),
('PRIMEROS_AUX', 'CUIDADO', 'Curso Primeros Auxilios (Vigente)', 2),
('INYECTOLOGIA', 'CUIDADO', 'Certificado de Inyectología', 3),
('GERIATRIA', 'CUIDADO', 'Experiencia con Pacientes Postrados', 4),
('PEDAGOGIA', 'CUIDADO', 'Conocimientos Pedagógicos (Niños)', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('ENFERMERA', 'CUIDADO', 'Enfermera(o) Domiciliaria', 1),
('CUIDADOR_ADULTO', 'CUIDADO', 'Cuidador de Adulto Mayor', 2),
('NINERA', 'CUIDADO', 'Niñera / Babysitter', 3),
('TERAPEUTA', 'CUIDADO', 'Terapeuta Física / Respiratoria', 4)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- ----------------- HOGAR -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('COCINA_CRIOLLA', 'HOGAR', 'Cocina Criolla Colombiana', 1),
('LIMPIEZA_PRO', 'HOGAR', 'Técnicas de Limpieza Profunda', 2),
('REFERENCIAS', 'HOGAR', 'Referencias Laborales Verificables', 3),
('MASCOTAS', 'HOGAR', 'Afinidad con Mascotas (Perros/Gatos)', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('ASEO_DIAS', 'HOGAR', 'Empleada por días (Aseo General)', 1),
('COCINERA', 'HOGAR', 'Cocinera Doméstica', 2),
('LAVADO_PLANCHADO', 'HOGAR', 'Experta en Lavado y Planchado', 3)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- ----------------- EVENTOS -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('PRESENCIA', 'EVENTOS', 'Excelente Presentación Personal', 1),
('INGLES', 'EVENTOS', 'Inglés Conversacional (Básico/Intermedio)', 2),
('ATENCION_VIP', 'EVENTOS', 'Experiencia en Atención VIP', 3),
('SONIDO', 'EVENTOS', 'Montaje Básico de Sonido/Luces', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('LOGISTICA_EV', 'EVENTOS', 'Logística de Eventos', 1),
('BOUNCER', 'EVENTOS', 'Seguridad / Bouncer', 2),
('PROTOCOLO_EV', 'EVENTOS', 'Modelo de Protocolo / Azafata', 3), -- Fix ID clash with GASTRO skill
('ANIMADOR', 'EVENTOS', 'Animador / Recreacionista', 4)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- ----------------- AGRO -----------------
INSERT INTO public.taxonomy_skills (id, sector_id, label, sort_order) VALUES
('GUADANA', 'AGRO', 'Manejo de Guadaña', 1),
('CAFE', 'AGRO', 'Experiencia Recolección Café', 2),
('CARGA_AGRO', 'AGRO', 'Carga de Bultos Agrícolas', 3),
('ANIMALES', 'AGRO', 'Cuidado de Animales de Granja', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.taxonomy_roles (id, sector_id, label, sort_order) VALUES
('RECOLECTOR', 'AGRO', 'Recolector (Cosecha)', 1),
('JORNALERO', 'AGRO', 'Jornalero (Machete/Azadón)', 2),
('GALPONERO', 'AGRO', 'Galponero (Avícola/Porcícola)', 3),
('MAYORDOMO', 'AGRO', 'Mayordomo / Casero (Reemplazos)', 4)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

-- Log de éxito para la consola SQL
DO $$ BEGIN RAISE NOTICE '✅ Taxonomía base poblada con éxito. Listo para sincronización Frontend.'; END $$;
