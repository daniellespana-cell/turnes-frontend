-- ============================================================
-- 🏗️ SENIOR GEO-ARCHITECTURE — Single Source of Truth v2
-- ============================================================
-- Cobertura: 32 capitales + ~100 municipios metropolitanos y ciudades intermedias
-- Ejecutar TODO en orden en Supabase SQL Editor.
-- Idempotente: seguro re-ejecutar en cualquier momento.
-- ============================================================

-- ── PASO 1: Tabla maestra de ciudades ──────────────────────
CREATE TABLE IF NOT EXISTS ciudades_coords (
    nombre          TEXT PRIMARY KEY,
    nombre_lower    TEXT GENERATED ALWAYS AS (lower(nombre)) STORED UNIQUE,
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    departamento    TEXT,
    activa          BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_ciudades_nombre_lower ON ciudades_coords (nombre_lower);

-- 🛡️ PERMISSIONS & SECURITY
ALTER TABLE ciudades_coords ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON ciudades_coords TO anon, authenticated;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ciudades_coords' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON ciudades_coords FOR SELECT USING (true);
    END IF;
END $$;

-- ── PASO 2: Datos completos ─────────────────────────────────
INSERT INTO ciudades_coords (nombre, lat, lng, departamento) VALUES

-- ═══════════════════════════════════════
-- CUNDINAMARCA / BOGOTÁ (45)
-- ═══════════════════════════════════════
('Bogotá D.C.',       4.6097,  -74.0817, 'Cundinamarca'),
('Soacha',            4.5872,  -74.2213, 'Cundinamarca'),
('Chía',              4.8647,  -74.0583, 'Cundinamarca'),
('Cajicá',            4.9242,  -74.0270, 'Cundinamarca'),
('Mosquera',          4.7059,  -74.2302, 'Cundinamarca'),
('Madrid',            4.7324,  -74.2642, 'Cundinamarca'),
('Funza',             4.7171,  -74.2120, 'Cundinamarca'),
('Zipaquirá',         5.0233,  -74.0056, 'Cundinamarca'),
('Facatativá',        4.8137,  -74.3574, 'Cundinamarca'),
('Tocancipá',         4.9713,  -73.9117, 'Cundinamarca'),
('Cota',              4.8126,  -74.1068, 'Cundinamarca'),
('Sibaté',            4.4919,  -74.2597, 'Cundinamarca'),
('Sopó',              4.9117,  -73.9354, 'Cundinamarca'),
('Tenjo',             4.8716,  -74.1432, 'Cundinamarca'),
('La Calera',         4.7205,  -73.9709, 'Cundinamarca'),
('Fusagasugá',        4.3423,  -74.3640, 'Cundinamarca'),
('Girardot',          4.3035,  -74.7994, 'Cundinamarca'),
('Villeta',           5.0131,  -74.4741, 'Cundinamarca'),
('Gachancipá',        4.9971,  -73.8725, 'Cundinamarca'),
('Nemocón',           4.9953,  -73.8777, 'Cundinamarca'),
('Tabio',             4.9038,  -74.1030, 'Cundinamarca'),
('Cogua',             5.0601,  -73.9786, 'Cundinamarca'),
('Sesquilé',          5.0453,  -73.7972, 'Cundinamarca'),
('Guatavita',         4.9372,  -73.8369, 'Cundinamarca'),
('La Vega',           4.9972,  -74.3411, 'Cundinamarca'),
('Guaduas',           5.0672,  -74.5956, 'Cundinamarca'),
('Pacho',             5.1292,  -74.1614, 'Cundinamarca'),
('Ubaté',             5.3094,  -73.8139, 'Cundinamarca'),
('Choachí',           4.5311,  -73.9211, 'Cundinamarca'),
('Cáqueza',           4.4072,  -73.9456, 'Cundinamarca'),
('Puerto Salgar',     5.4631,  -74.6542, 'Cundinamarca'),
('Guasca',            4.8647,  -73.8772, 'Cundinamarca'),
('Simijaca',          5.5031,  -73.8503, 'Cundinamarca'),
('Lenguazaque',       5.3036,  -73.7142, 'Cundinamarca'),
('Chocontá',          5.1453,  -73.6844, 'Cundinamarca'),
('Villapinzón',       5.2153,  -73.6053, 'Cundinamarca'),
('Gachetá',           4.8144,  -73.6372, 'Cundinamarca'),
('Medina',            4.5072,  -73.3497, 'Cundinamarca'),
('Paratebueno',       4.3772,  -73.2144, 'Cundinamarca'),
('Arbeláez',          4.2717,  -74.4158, 'Cundinamarca'),
('Silvania',          4.4036,  -74.3867, 'Cundinamarca'),
('Susa',              5.4525,  -73.8172, 'Cundinamarca'),
('Tausa',             5.1972,  -73.8867, 'Cundinamarca'),
('Vianí',             4.8772,  -74.5647, 'Cundinamarca'),
('Une',               4.4031,  -74.0256, 'Cundinamarca'),

-- ═══════════════════════════════════════
-- ANTIOQUIA / MEDELLÍN (40)
-- ═══════════════════════════════════════
('Medellín',          6.2442,  -75.5812, 'Antioquia'),
('Bello',             6.3373,  -75.5579, 'Antioquia'),
('Itagüí',            6.1846,  -75.5991, 'Antioquia'),
('Envigado',          6.1759,  -75.5917, 'Antioquia'),
('Sabaneta',          6.1515,  -75.6171, 'Antioquia'),
('La Estrella',       6.1567,  -75.6428, 'Antioquia'),
('Copacabana',        6.3497,  -75.5121, 'Antioquia'),
('Girardota',         6.3764,  -75.4498, 'Antioquia'),
('Barbosa',           6.4387,  -75.3312, 'Antioquia'),
('Caldas',            6.0958,  -75.6378, 'Antioquia'),
('Rionegro',          6.1534,  -75.3743, 'Antioquia'),
('Turbo',             8.0975,  -76.7291, 'Antioquia'),
('Apartadó',          7.8823,  -76.6272, 'Antioquia'),
('Caucasia',          7.9877,  -75.1966, 'Antioquia'),
('Yarumal',           6.9650,  -75.4150, 'Antioquia'),
('La Ceja',           6.0315,  -75.4312, 'Antioquia'),
('Marinilla',         6.1736,  -75.3375, 'Antioquia'),
('Guarne',            6.2817,  -75.4431, 'Antioquia'),
('El Retiro',         6.0572,  -75.5036, 'Antioquia'),
('Carmen de Viboral', 6.0831,  -75.3347, 'Antioquia'),
('Amalfi',            6.9072,  -75.0772, 'Antioquia'),
('Santuario',         6.1367,  -75.2647, 'Antioquia'),
('Santa Rosa Osos',   6.6472,  -75.4611, 'Antioquia'),
('Donmatías',         6.4872,  -75.5111, 'Antioquia'),
('Puerto Berrío',     6.4897,  -74.4031, 'Antioquia'),
('Segovia',           7.0786,  -74.7031, 'Antioquia'),
('Carepa',            7.7572,  -76.6572, 'Antioquia'),
('Chigorodó',         7.6717,  -76.6811, 'Antioquia'),
('Santa Fe de Ant',   6.5572,  -75.8311, 'Antioquia'),
('La Pintada',        5.7486,  -75.6072, 'Antioquia'),
('Urrao',             6.3153,  -76.1347, 'Antioquia'),
('Dabeiba',           7.0017,  -76.2647, 'Antioquia'),
('Jardín',            5.5986,  -75.8194, 'Antioquia'),
('Jericó',            5.7917,  -75.7867, 'Antioquia'),
('Pueblorrico',       5.7917,  -75.8456, 'Antioquia'),
('Yolombó',           6.5986,  -75.0111, 'Antioquia'),
('San Roque',         6.4847,  -74.8694, 'Antioquia'),
('Gómez Plata',       6.7217,  -75.2194, 'Antioquia'),
('Puerto Nare',       6.1867,  -74.5867, 'Antioquia'),
('San Pedro Milagro', 6.4586,  -75.5583, 'Antioquia'),

-- ═══════════════════════════════════════
-- SANTANDER / BUCARAMANGA (35)
-- ═══════════════════════════════════════
('Bucaramanga',       7.1193,  -73.1227, 'Santander'),
('Floridablanca',     7.0624,  -73.0862, 'Santander'),
('Piedecuesta',       6.9875,  -73.0494, 'Santander'),
('Girón',             7.0682,  -73.1698, 'Santander'),
('Barrancabermeja',   7.0651,  -73.8570, 'Santander'),
('San Gil',           6.5584,  -73.1349, 'Santander'),
('Socorro',           6.5163,  -73.2671, 'Santander'),
('Málaga',            6.7009,  -72.7279, 'Santander'),
('Vélez',             6.0134,  -73.6790, 'Santander'),
('Lebrija',           7.1147,  -73.2167, 'Santander'),
('Zapatoca',          6.8153,  -73.2711, 'Santander'),
('Barichara',         6.6372,  -73.2211, 'Santander'),
('Barbosa Sant',      5.9333,  -73.6167, 'Santander'),
('Sabana de Torres',  7.3917,  -73.5111, 'Santander'),
('San Vicente Chuc',  6.8831,  -73.4111, 'Santander'),
('Cimitarra',         6.3097,  -73.9497, 'Santander'),
('Puerto Wilches',    7.3486,  -73.9111, 'Santander'),
('Los Santos',        6.7572,  -73.1111, 'Santander'),
('Rionegro Sant',     7.4331,  -73.1497, 'Santander'),
('Oiba',              6.2653,  -73.3011, 'Santander'),
('Charalá',           6.2086,  -73.1694, 'Santander'),
('Aratoca',           6.6917,  -73.0194, 'Santander'),
('Curití',            6.6083,  -73.0694, 'Santander'),
('Simacota',          6.4417,  -73.4417, 'Santander'),
('Suaita',            6.1017,  -73.4417, 'Santander'),
('Landyzuri',         6.2167,  -73.8167, 'Santander'),
('El Playón',         7.4772,  -73.2031, 'Santander'),
('Mogotes',           6.4831,  -72.9711, 'Santander'),
('Betulia',           6.9117,  -73.2831, 'Santander'),
('Matanza',           7.3205,  -73.0111, 'Santander'),
('Suratá',            7.3653,  -72.9031, 'Santander'),
('Tona',              7.2083,  -72.9647, 'Santander'),
('California',        7.3486,  -72.9497, 'Santander'),
('Vetas',             7.3097,  -72.8831, 'Santander'),
('Jesus Maria',       5.8667,  -73.7833, 'Santander'),

-- ═══════════════════════════════════════
-- VALLE DEL CAUCA / CALI (25)
-- ═══════════════════════════════════════
('Cali',              3.4516,  -76.5320, 'Valle del Cauca'),
('Palmira',           3.5394,  -76.3036, 'Valle del Cauca'),
('Yumbo',             3.5806,  -76.4951, 'Valle del Cauca'),
('Jamundí',           3.2612,  -76.5413, 'Valle del Cauca'),
('Buga',              3.9009,  -76.2978, 'Valle del Cauca'),
('Buenaventura',      3.8801,  -77.0311, 'Valle del Cauca'),
('Tulúa',             4.0842,  -76.1989, 'Valle del Cauca'),
('Cartago',           4.7459,  -75.9126, 'Valle del Cauca'),
('Candelaria',        3.4091,  -76.3470, 'Valle del Cauca'),
('Florida',           3.3271,  -76.2376, 'Valle del Cauca'),
('Pradera',           3.4225,  -76.2444, 'Valle del Cauca'),
('Ginebra',           3.7253,  -76.2647, 'Valle del Cauca'),
('Guacarí',           3.7642,  -76.3311, 'Valle del Cauca'),
('Zarzal',            4.3917,  -76.0711, 'Valle del Cauca'),
('Roldanillo',        4.4144,  -76.1556, 'Valle del Cauca'),
('Sevilla Valle',     4.2647,  -75.9311, 'Valle del Cauca'),
('Caicedonia',        4.3311,  -75.8311, 'Valle del Cauca'),
('Bugalagrande',      4.2086,  -76.1583, 'Valle del Cauca'),
('Dagua',             3.6586,  -76.6867, 'Valle del Cauca'),
('La Cumbre',         3.6472,  -76.5647, 'Valle del Cauca'),
('Restrepo Valle',    3.8211,  -76.5211, 'Valle del Cauca'),
('Calima Darien',     3.9311,  -76.4867, 'Valle del Cauca'),
('Yotoco',            3.8647,  -76.3867, 'Valle del Cauca'),
('Vijes',             3.6917,  -76.4367, 'Valle del Cauca'),
('La Union Valle',    4.5367,  -76.1031, 'Valle del Cauca'),

-- ═══════════════════════════════════════
-- ATLÁNTICO / BARRANQUILLA (15)
-- ═══════════════════════════════════════
('Barranquilla',     10.9685,  -74.7813, 'Atlántico'),
('Soledad',          10.9184,  -74.7699, 'Atlántico'),
('Puerto Colombia',  10.9880,  -74.9626, 'Atlántico'),
('Malambo',          10.8612,  -74.7795, 'Atlántico'),
('Galapa',           10.8975,  -74.8912, 'Atlántico'),
('Baranoa',          10.7982,  -74.9227, 'Atlántico'),
('Sabanagrande',     10.7944,  -74.7508, 'Atlántico'),
('Sabanalarga',      10.6331,  -74.9211, 'Atlántico'),
('Palmar Varela',    10.7417,  -74.7556, 'Atlántico'),
('Luruaco',          10.6117,  -75.1431, 'Atlántico'),
('Repelon',          10.4917,  -75.1256, 'Atlántico'),
('Juan de Acosta',   10.8286,  -75.0311, 'Atlántico'),
('Tubará',           10.8772,  -74.9786, 'Atlántico'),
('Piojó',            10.7486,  -75.0867, 'Atlántico'),
('Usiacurí',         10.7511,  -74.9811, 'Atlántico'),

-- ═══════════════════════════════════════
-- NORTE DE SANTANDER / CÚCUTA (12)
-- ═══════════════════════════════════════
('Cúcuta',            7.8939,  -72.5078, 'Norte de Santander'),
('Los Patios',        7.8462,  -72.5011, 'Norte de Santander'),
('Villa del Rosario', 7.8358,  -72.4735, 'Norte de Santander'),
('Ocaña',             8.2382,  -73.3566, 'Norte de Santander'),
('Pamplona',          7.3764,  -72.6479, 'Norte de Santander'),
('El Zulia',          7.9393,  -72.6014, 'Norte de Santander'),
('Chinácota',         7.6117,  -72.6011, 'Norte de Santander'),
('Abrego',            8.0811,  -73.2211, 'Norte de Santander'),
('Sardinata',         8.0847,  -72.8211, 'Norte de Santander'),
('Toledo',            7.3117,  -72.4831, 'Norte de Santander'),
('Convencion',        8.4867,  -73.1972, 'Norte de Santander'),
('Teorama',           8.4372,  -73.2867, 'Norte de Santander'),

-- ═══════════════════════════════════════
-- EJE CAFETERO (20)
-- ═══════════════════════════════════════
('Pereira',           4.8133,  -75.6961, 'Risaralda'),
('Dosquebradas',      4.8396,  -75.6738, 'Risaralda'),
('Santa Rosa de Cabal',4.8692, -75.6217, 'Risaralda'),
('La Virginia',       4.9000,  -75.8833, 'Risaralda'),
('Manizales',         5.0702,  -75.5138, 'Caldas'),
('Villamaría',        5.0252,  -75.4979, 'Caldas'),
('Chinchiná',         4.9784,  -75.6049, 'Caldas'),
('La Dorada',         5.4537,  -74.6645, 'Caldas'),
('Riosucio',          5.4224,  -75.7207, 'Caldas'),
('Armenia',           4.5338,  -75.6811, 'Quindío'),
('Calarcá',           4.5366,  -75.6434, 'Quindío'),
('Montenegro',        4.5643,  -75.7540, 'Quindío'),
('La Tebaida',        4.4540,  -75.7966, 'Quindío'),
('Quimbaya',          4.6211,  -75.7644, 'Quindío'),
('Circasia',          4.6186,  -75.6367, 'Quindío'),
('Filandia',          4.6736,  -75.6611, 'Quindío'),
('Salento',           4.6372,  -75.5711, 'Quindío'),
('Anserma',           5.2344,  -75.7867, 'Caldas'),
('Pueblo Rico',       5.2331,  -76.0311, 'Risaralda'),
('Belen de Umbria',   5.1983,  -75.8647, 'Risaralda'),

-- ═══════════════════════════════════════
-- BOLÍVAR / CARTAGENA (12)
-- ═══════════════════════════════════════
('Cartagena',        10.3910,  -75.4794, 'Bolívar'),
('Turbaco',          10.3378,  -75.4159, 'Bolívar'),
('Arjona',           10.2578,  -75.3497, 'Bolívar'),
('Magangué',          9.2435,  -74.7530, 'Bolívar'),
('El Carmen de Bolívar', 9.7172, -75.1197, 'Bolívar'),
('Turbana',          10.2744,  -75.4411, 'Bolívar'),
('Santa Rosa Sur',   10.4431,  -75.3647, 'Bolívar'),
('Mompox',            9.2411,  -74.4211, 'Bolívar'),
('Maria la Baja',     9.9867,  -75.3011, 'Bolívar'),
('Villanueva Bol',   10.4444,  -75.2711, 'Bolívar'),
('Clemencia',        10.5647,  -75.3211, 'Bolívar'),
('Santa Catalina',   10.6031,  -75.2867, 'Bolívar'),

-- ═══════════════════════════════════════
-- COSTA CARIBE — OTROS (25)
-- ═══════════════════════════════════════
('Santa Marta',      11.2407,  -74.1990, 'Magdalena'),
('Ciénaga',          11.0049,  -74.2526, 'Magdalena'),
('Fundación',        10.5211,  -74.1878, 'Magdalena'),
('Montería',          8.7479,  -75.8814, 'Córdoba'),
('Cereté',            8.8866,  -75.7937, 'Córdoba'),
('Sahagún',           8.9492,  -75.4458, 'Córdoba'),
('Montelíbano',       7.9834,  -75.4217, 'Córdoba'),
('Sincelejo',         9.2931,  -75.3976, 'Sucre'),
('Corozal',           9.3217,  -75.2894, 'Sucre'),
('Sampués',           9.1816,  -75.3751, 'Sucre'),
('Valledupar',       10.4631,  -73.2532, 'Cesar'),
('Aguachica',         8.3091,  -73.6180, 'Cesar'),
('Codazzi',          10.0341,  -73.2361, 'Cesar'),
('Riohacha',         11.5444,  -72.9072, 'La Guajira'),
('Maicao',           11.3832,  -72.2432, 'La Guajira'),
('Plato',             9.7911,  -74.7811, 'Magdalena'),
('Aracataca',        10.5911,  -74.1911, 'Magdalena'),
('Lorica',            9.2317,  -75.8111, 'Córdoba'),
('Planeta Rica',      8.4117,  -75.5847, 'Córdoba'),
('Tierralta',         8.1736,  -76.0647, 'Córdoba'),
('San Onofre',        9.7347,  -75.5211, 'Sucre'),
('Tolu',              9.5244,  -75.5811, 'Sucre'),
('Manaure',          11.7753,  -72.4411, 'La Guajira'),
('Uribia',           11.7136,  -72.2647, 'La Guajira'),
('Fonseca',          10.8867,  -72.8511, 'La Guajira'),

-- ═══════════════════════════════════════
-- BOYACÁ (12)
-- ═══════════════════════════════════════
('Tunja',             5.5352,  -73.3677, 'Boyacá'),
('Duitama',           5.8218,  -73.0277, 'Boyacá'),
('Sogamoso',          5.7190,  -72.9348, 'Boyacá'),
('Chiquinquirá',      5.6183,  -73.8186, 'Boyacá'),
('Paipa',             5.7873,  -73.1148, 'Boyacá'),
('Puerto Boyacá',     5.9767,  -74.5867, 'Boyacá'),
('Moniquirá',         5.8744,  -73.5711, 'Boyacá'),
('Villa de Leyva',    5.6372,  -73.5211, 'Boyacá'),
('Samacá',            5.5031,  -73.4831, 'Boyacá'),
('Garagoa',           5.0847,  -73.3647, 'Boyacá'),
('Guateque',          5.0086,  -73.4694, 'Boyacá'),
('Soatá',             6.3311,  -72.6811, 'Boyacá'),

-- ═══════════════════════════════════════
-- TOLIMA / HUILA (15)
-- ═══════════════════════════════════════
('Ibagué',            4.4388,  -75.2322, 'Tolima'),
('Espinal',           4.1537,  -74.8911, 'Tolima'),
('Melgar',            4.2029,  -74.6458, 'Tolima'),
('Honda',             5.2074,  -74.7434, 'Tolima'),
('Mariquita',         5.2017,  -74.8911, 'Tolima'),
('Libano',            4.9211,  -75.0647, 'Tolima'),
('Chaparrál',         3.7211,  -75.4867, 'Tolima'),
('Neiva',             2.9273,  -75.2818, 'Huila'),
('Pitalito',          1.8532,  -76.0495, 'Huila'),
('Garzón',            2.1995,  -75.6282, 'Huila'),
('La Plata',          2.3846,  -75.8956, 'Huila'),
('Gigante',           2.3867,  -75.5456, 'Huila'),
('Campoalegre',       2.6867,  -75.3211, 'Huila'),
('Algeciras',         2.5211,  -75.3111, 'Huila'),
('Rivera',            2.7772,  -75.2556, 'Huila'),

-- ═══════════════════════════════════════
-- NARIÑO / CAUCA (12)
-- ═══════════════════════════════════════
('Pasto',             1.2077,  -77.2772, 'Nariño'),
('Tumaco',            1.7990,  -78.7681, 'Nariño'),
('Ipiales',           0.8283,  -77.6447, 'Nariño'),
('Túquerres',         1.0895,  -77.6152, 'Nariño'),
('La Union Narino',   1.6031,  -77.1311, 'Nariño'),
('Popayán',           2.4448,  -76.6147, 'Cauca'),
('Santander de Quilichao', 3.0080, -76.4852, 'Cauca'),
('Puerto Tejada',     3.2333,  -76.4167, 'Cauca'),
('Miranda',           3.2511,  -76.2311, 'Cauca'),
('El Tambo',          2.4511,  -76.8111, 'Cauca'),
('La Sierra',         2.1811,  -76.7611, 'Cauca'),
('Patia',             2.0711,  -77.0311, 'Cauca'),

-- ═══════════════════════════════════════
-- META / CASANARE / LLANOS (10)
-- ═══════════════════════════════════════
('Villavicencio',     4.1420,  -73.6266, 'Meta'),
('Acacías',           3.9924,  -73.7617, 'Meta'),
('Granada',           3.5371,  -73.7044, 'Meta'),
('Yopal',             5.3444,  -72.3961, 'Casanare'),
('Aguazul',           5.1671,  -72.5509, 'Casanare'),
('Tauramena',         5.0173,  -72.6456, 'Casanare'),
('Puerto Lopez',      4.0847,  -72.9647, 'Meta'),
('Cumaral',           4.2711,  -73.4867, 'Meta'),
('Paz de Ariporo',    5.8831,  -71.8956, 'Casanare'),
('Orocue',            4.7911,  -71.3347, 'Casanare'),

-- ═══════════════════════════════════════
-- CAPITALES RESTANTES & OTROS (15)
-- ═══════════════════════════════════════
('Arauca',            7.0824,  -70.7570, 'Arauca'),
('Florencia',         1.6158,  -75.6143, 'Caquetá'),
('Quibdó',            5.6930,  -76.6575, 'Chocó'),
('Mocoa',             1.1495,  -76.6433, 'Putumayo'),
('San Andrés',       12.5833,  -81.7000, 'San Andrés y Providencia'),
('Inírida',           3.8650,  -67.9259, 'Guainía'),
('San José Guaviare', 2.5786, -72.6459, 'Guaviare'),
('Mitú',              1.2500,  -70.2333, 'Vaupés'),
('Puerto Carreño',    6.1895,  -67.4851, 'Vichada'),
('Leticia',          -4.2155,  -69.9404, 'Amazonas'),
('Riosucio Chocó',    7.4313,  -77.1170, 'Chocó'),
('Istmira',           5.1572,  -76.6867, 'Chocó'),
('Saravena',          6.9536,  -71.8867, 'Arauca'),
('Tame',              6.4647,  -71.7347, 'Arauca'),
('Puerto Asis',       0.5072,  -76.5031, 'Putumayo')

ON CONFLICT (nombre) DO UPDATE
    SET lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        departamento = EXCLUDED.departamento;


-- ── PASO 3: Trigger function ────────────────────────────────
CREATE OR REPLACE FUNCTION fn_auto_fill_vacancy_coords()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_lat DOUBLE PRECISION;
    v_lng DOUBLE PRECISION;
BEGIN
    IF (NEW.lat IS NULL OR NEW.lng IS NULL) AND NEW.direccion_formateada IS NOT NULL THEN
        SELECT lat, lng
        INTO v_lat, v_lng
        FROM ciudades_coords
        WHERE nombre_lower = lower(trim(NEW.direccion_formateada))
        LIMIT 1;

        IF v_lat IS NOT NULL THEN
            NEW.lat = v_lat;
            NEW.lng = v_lng;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_fill_vacancy_coords ON vacantes;
CREATE TRIGGER trg_auto_fill_vacancy_coords
    BEFORE INSERT OR UPDATE OF direccion_formateada, lat, lng
    ON vacantes
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_fill_vacancy_coords();


-- ── PASO 4: Patch vacantes existentes con lat/lng nulos ────
UPDATE vacantes v
SET
    lat = c.lat,
    lng = c.lng
FROM ciudades_coords c
WHERE
    (v.lat IS NULL OR v.lng IS NULL)
    AND lower(trim(v.direccion_formateada)) = c.nombre_lower;


-- ── VERIFICACIÓN ────────────────────────────────────────────
SELECT COUNT(*) AS total_ciudades FROM ciudades_coords;

SELECT id, titulo, direccion_formateada, lat, lng, status
FROM vacantes ORDER BY created_at DESC LIMIT 10;

SELECT id, titulo, direccion_formateada
FROM vacantes WHERE lat IS NULL OR lng IS NULL;
