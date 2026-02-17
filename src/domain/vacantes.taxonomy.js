/**
 * 🧠 CEREBRO SEMÁNTICO DE TURNES
 * Define la jerarquía de roles y los "Hard Skills" (requisitos binarios)
 * para el algoritmo de match inteligente.
 */

export const VACANTES_TAXONOMY = {
  GASTRONOMIA: {
    id: 'GASTRO',
    label: "Gastronomía y Bares 🍔",
    description: "Velocidad y técnica. Sector de alta rotación.",
    roles: [
      {
        id: 'MESERO',
        label: "Mesero / Camarero",
        slug: 'mesero',
        marketing: {
          title: "Mesero de Protocolo",
          accentColor: 'text-orange-400',
          description: "Atención al cliente con energía. Únete a equipos de eventos y restaurantes de alta rotación.",
          job: { title: "Mesero de Protocolo", salary: "COP 60,000 / hora", location: "Cañaveral, Floridablanca", hours: "6 horas", reqs: ["Experiencia en mesa", "Excelente presentación", "Curso de manipulación"] }
        }
      },
      { id: 'LAVAPLATOS', label: "Lavaplatos / Steward" },
      {
        id: 'AYU_COCINA',
        label: "Ayudante de Cocina",
        slug: 'ayudante',
        marketing: {
          title: "Ayudante de Cocina",
          accentColor: 'text-gray-400',
          description: "El soporte vital de cualquier cocina. Aprende y gana dinero en turnos de apoyo.",
          job: { title: "Auxiliar de Cocina", salary: "COP 50,000 / hora", location: "Centro, Bucaramanga", hours: "8 horas", reqs: ["Rapidez", "Limpieza", "Disponibilidad inmediata"] }
        }
      },
      {
        id: 'PARRILLERO',
        label: "Parrillero / Asador",
        slug: 'cocinero', // Mapping 'cocinero' generic slug here for demo
        marketing: {
          title: "Cocinero Rápido (Línea)",
          accentColor: 'text-red-400',
          description: "Trabaja en cocinas dinámicas de Piedecuesta a Girón. Cubre picos de demanda en restaurantes que necesitan tu velocidad y eficiencia.",
          job: { title: "Ayuda de Cocina - Servicio Nocturno", salary: "COP 70,000 / hora", location: "Zona Industrial, Girón", hours: "8 horas", reqs: ["Carnet de manipulación de alimentos", "Experiencia en Parrilla", "Trabajo bajo presión"] }
        }
      },
      {
        id: 'BARTENDER',
        label: "Bartender / Barman",
        slug: 'bartender',
        marketing: {
          title: "Bartender de Eventos",
          accentColor: 'text-pink-400',
          description: "Encuentra turnos flexibles para eventos privados y corporativos. Demuestra tu mixología sin ataduras de un contrato fijo.",
          job: { title: "Turno Bartender Nocturno", salary: "COP 70,000 / hora", location: "Zona Rosa, Bucaramanga", hours: "6 horas", reqs: ["Conocimiento de coctelería clásica", "Manejo de TPV", "Inglés intermedio"] }
        }
      },
      { id: 'DOMICILIARIO', label: "Domiciliario (Moto/Bici)" },
      {
        id: 'BARISTA', // Added manually as it was missing in original roles list but present in skills
        label: "Barista Profesional",
        slug: 'barista',
        marketing: {
          title: "Barista Profesional",
          accentColor: 'text-yellow-400',
          description: "Únete a la comunidad de baristas más solicitada. Turnes te conecta con cafeterías de especialidad que valoran tu arte y pagan por hora.",
          job: { title: "Turno Barista de Mañana", salary: "COP 70,000 / hora", location: "Centro, Bucaramanga", hours: "5 horas", reqs: ["Experiencia Latte Art", "Manejo de Tostadora", "Disponibilidad Fines de Semana"] }
        }
      },
      {
        id: 'REPOSTERO',
        label: "Repostero / Pastelero",
        slug: 'reposteria',
        marketing: {
          title: "Chef de Repostería",
          accentColor: 'text-teal-400',
          description: "Los mejores postres requieren el mejor talento. Conecta con pastelerías de alta demanda para turnos especializados.",
          job: { title: "Turno Repostero Fino", salary: "COP 70,000 / hora", location: "Cabecera, Bucaramanga", hours: "4 horas", reqs: ["Manejo de masas", "Decoración artística", "Certificado de higiene"] }
        }
      }
    ],
    skills: [ // Checkboxes
      { id: 'MANIPULACION', label: "Curso Manipulación Alimentos (Vigente)" },
      { id: 'COCTELERIA', label: "Experiencia en Coctelería" },
      { id: 'PROTOCOLO', label: "Protocolo de Mesa y Etiqueta" },
      { id: 'BARISMO', label: "Manejo Máquina de Café (Básico)" },
      { id: 'MOTO_PROPIA', label: "Vehículo Propio + Papeles al día" }
    ]
  },

  CONSTRUCCION: {
    id: 'CONSTRUCCION',
    label: "Construcción y Mantenimiento 🏗️",
    description: "Fuerza física o conocimientos técnicos puntuales.",
    roles: [
      { id: 'AYU_OBRA', label: "Ayudante de Obra" },
      { id: 'OFICIAL', label: "Oficial de Obra" },
      { id: 'PINTOR', label: "Pintor / Estucador" },
      { id: 'TODERO', label: "Todero (Reparaciones Locativas)" },
      { id: 'ELECTRICISTA', label: "Electricista Básico" },
      { id: 'PLOMERO', label: "Plomero / Fontanero" }
    ],
    skills: [
      { id: 'ALTURAS', label: "Curso de Alturas (Vigente)" },
      { id: 'HERRAMIENTA', label: "Cuenta con Herramienta Propia" },
      { id: 'MATRICULA_CONTE', label: "Matrícula CONTE (Electricidad)" },
      { id: 'OBRA_BLANCA', label: "Experiencia en Obra Blanca/Acabados" }
    ]
  },



  LOGISTICA: {
    id: 'LOGISTICA',
    label: "Logística y Carga 📦",
    description: "Bodegas, mudanzas y organización.",
    roles: [
      { id: 'COTERO', label: "Cotero / Cargue y Descargue" },
      { id: 'BODEGUERO', label: "Auxiliar de Bodega" },
      { id: 'EMPACADOR', label: "Empacador / Picking" },
      { id: 'AUX_CAMION', label: "Auxiliar de Ruta/Camión" }
    ],
    skills: [
      { id: 'FUERZA', label: "Aptitud para Carga Pesada" },
      { id: 'INVENTARIOS', label: "Manejo Básico de Inventarios" },
      { id: 'ESTIBADORA', label: "Manejo de Zorra / Estibadora Manual" },
      { id: 'UBICACION', label: "Conocimiento de Nomenclatura Urbana" }
    ]
  },

  BELLEZA: {
    id: 'BELLEZA',
    label: "Belleza y Estética 💅",
    description: "Talento técnico probado.",
    roles: [
      { id: 'MANICURISTA', label: "Manicurista" },
      { id: 'ESTILISTA', label: "Estilista / Peluquero(a)" },
      { id: 'BARBERO', label: "Barbero" },
      { id: 'AUX_PELUQUERIA', label: "Auxiliar de Peluquería" }
    ],
    skills: [
      { id: 'SISTEMAS_U', label: "Sistemas (Acrílico/Gel/Semi)" },
      { id: 'COLOR', label: "Colorimetría y Tintes" },
      { id: 'FADE', label: "Desvanecidos (Barbería Moderna)" },
      { id: 'KIT_PROPIO', label: "Cuenta con Maleta/Insumos Propios" }
    ]
  },

  SALUD_CUIDADO: {
    id: 'CUIDADO',
    label: "Salud y Cuidado de Personas 🩺",
    description: "Asistencia profesional y cuidado humano.",
    roles: [
      { id: 'ENFERMERA', label: "Enfermera(o) Domiciliaria" },
      { id: 'CUIDADOR_ADULTO', label: "Cuidador de Adulto Mayor" },
      { id: 'NINERA', label: "Niñera / Babysitter" },
      { id: 'TERAPEUTA', label: "Terapeuta Física / Respiratoria" }
    ],
    skills: [
      { id: 'RETHUS', label: "Registro RETHUS (Salud)" },
      { id: 'PRIMEROS_AUX', label: "Curso Primeros Auxilios (Vigente)" },
      { id: 'INYECTOLOGIA', label: "Certificado de Inyectología" },
      { id: 'GERIATRIA', label: "Experiencia con Pacientes Postrados" },
      { id: 'PEDAGOGIA', label: "Conocimientos Pedagógicos (Niños)" }
    ]
  },

  HOGAR: {
    id: 'HOGAR',
    label: "Hogar y Limpieza 🧹",
    description: "Servicios domésticos de confianza.",
    roles: [
      { id: 'ASEO_DIAS', label: "Empleada por días (Aseo General)" },
      { id: 'COCINERA', label: "Cocinera Doméstica" },
      { id: 'LAVADO_PLANCHADO', label: "Experta en Lavado y Planchado" }
    ],
    skills: [
      { id: 'COCINA_CRIOLLA', label: "Cocina Criolla Colombiana" },
      { id: 'LIMPIEZA_PRO', label: "Técnicas de Limpieza Profunda" },
      { id: 'REFERENCIAS', label: "Referencias Laborales Verificables" },
      { id: 'MASCOTAS', label: "Afinidad con Mascotas (Perros/Gatos)" }
    ]
  },

  EVENTOS: {
    id: 'EVENTOS',
    label: "Eventos y Entretenimiento 🎉",
    description: "Imagen y servicio al cliente.",
    roles: [
      { id: 'LOGISTICA_EV', label: "Logística de Eventos" },
      { id: 'BOUNCER', label: "Seguridad / Bouncer" },
      { id: 'PROTOCOLO', label: "Modelo de Protocolo / Azafata" },
      { id: 'ANIMADOR', label: "Animador / Recreacionista" }
    ],
    skills: [
      { id: 'PRESENCIA', label: "Excelente Presentación Personal" },
      { id: 'INGLES', label: "Inglés Conversacional (Básico/Intermedio)" },
      { id: 'ATENCION_VIP', label: "Experiencia en Atención VIP" },
      { id: 'SONIDO', label: "Montaje Básico de Sonido/Luces" }
    ]
  },

  AGRO: {
    id: 'AGRO',
    label: "Agro y Campo 🚜",
    description: "Trabajo rural por rendimiento.",
    roles: [
      { id: 'RECOLECTOR', label: "Recolector (Cosecha)" },
      { id: 'JORNALERO', label: "Jornalero (Machete/Azadón)" },
      { id: 'GALPONERO', label: "Galponero (Avícola/Porcícola)" },
      { id: 'MAYORDOMO', label: "Mayordomo / Casero (Reemplazos)" }
    ],
    skills: [
      { id: 'GUADANA', label: "Manejo de Guadaña" },
      { id: 'CAFE', label: "Experiencia Recolección Café" },
      { id: 'CARGA_AGRO', label: "Carga de Bultos Agrícolas" },
      { id: 'ANIMALES', label: "Cuidado de Animales de Granja" }
    ]
  }
};


// --- CONFIGURACIÓN DE APOYO (INALTERADA) ---

export const CIUDADES_COORDS = {
  // Cundinamarca
  "Bogotá D.C.": { lat: 4.6097, lng: -74.0817 },
  "Soacha": { lat: 4.5872, lng: -74.2213 },
  "Chía": { lat: 4.8647, lng: -74.0583 },
  "Cajicá": { lat: 4.9242, lng: -74.0270 },
  "Mosquera": { lat: 4.7059, lng: -74.2302 },
  "Madrid": { lat: 4.7324, lng: -74.2642 },
  "Funza": { lat: 4.7171, lng: -74.2120 },
  // Antioquia
  "Medellín": { lat: 6.2442, lng: -75.5812 },
  "Bello": { lat: 6.3373, lng: -75.5579 },
  "Itagüí": { lat: 6.1846, lng: -75.5991 },
  "Envigado": { lat: 6.1759, lng: -75.5917 },
  "Sabaneta": { lat: 6.1515, lng: -75.6171 },
  "Rionegro": { lat: 6.1534, lng: -75.3743 },
  // Valle
  "Cali": { lat: 3.4516, lng: -76.5320 },
  "Palmira": { lat: 3.5394, lng: -76.3036 },
  "Yumbo": { lat: 3.5806, lng: -76.4951 },
  "Jamundí": { lat: 3.2612, lng: -76.5413 },
  "Buga": { lat: 3.9009, lng: -76.2978 },
  // Atlántico
  "Barranquilla": { lat: 10.9685, lng: -74.7813 },
  "Soledad": { lat: 10.9184, lng: -74.7699 },
  "Puerto Colombia": { lat: 10.9880, lng: -74.9626 },
  // Santander
  "Bucaramanga": { lat: 7.1193, lng: -73.1227 },
  "Floridablanca": { lat: 7.0624, lng: -73.0862 },
  "Piedecuesta": { lat: 6.9875, lng: -73.0494 },
  "Girón": { lat: 7.0682, lng: -73.1698 },
  // Eje Cafetero
  "Pereira": { lat: 4.8133, lng: -75.6961 },
  "Dosquebradas": { lat: 4.8396, lng: -75.6738 },
  "Manizales": { lat: 5.0702, lng: -75.5138 },
  "Armenia": { lat: 4.5338, lng: -75.6811 },
  // Costa
  "Cartagena": { lat: 10.3910, lng: -75.4794 },
  "Santa Marta": { lat: 11.2407, lng: -74.1990 },
  "Montería": { lat: 8.7479, lng: -75.8814 },
  "Valledupar": { lat: 10.4631, lng: -73.2532 },
  // Otros
  "Cúcuta": { lat: 7.8939, lng: -72.5078 },
  "Villavicencio": { lat: 4.1420, lng: -73.6266 },
  "Ibagué": { lat: 4.4388, lng: -75.2322 },
  "Neiva": { lat: 2.9273, lng: -75.2818 },
  "Pasto": { lat: 1.2136, lng: -77.2811 },
  "Popayán": { lat: 2.4448, lng: -76.6147 },
  "Tunja": { lat: 5.5352, lng: -73.3677 }
};

export const CIUDADES_PRINCIPALES = Object.keys(CIUDADES_COORDS);

export const TURNOS_PREDEFINIDOS = [
  { id: "mañana_8_2", label: "Mañana (08:00 AM - 02:00 PM)", hours: 6 },
  { id: "tarde_2_8", label: "Tarde (02:00 PM - 08:00 PM)", hours: 6 },
  { id: "noche_8_2", label: "Noche (08:00 PM - 02:00 AM)", hours: 6 },
  { id: "trasnocho_10_6", label: "Trasnocho (10:00 PM - 06:00 AM)", hours: 8 },
  { id: "dia_completo", label: "Jornada Día (08:00 AM - 05:00 PM)", hours: 9 },
  { id: "por_hora", label: "Horario Personalizado (Definir en chat)", hours: 0 },
];

// --- UTILIDADES INTELIGENTES (UPDATED) ---

// 1. Obtener lista de categorías para el <select> principal
export const getCategoriasList = () => {
  return Object.values(VACANTES_TAXONOMY).map(cat => ({
    id: cat.id,
    label: cat.label,
    description: cat.description
  }));
};

// 2. Obtener roles dado un ID de categoría (ej: 'GASTRO')
export const getRolesBySector = (sectorId) => {
  const sector = Object.values(VACANTES_TAXONOMY).find(c => c.id === sectorId);
  return sector ? sector.roles : [];
};

// 3. Obtener skills (checkboxes) dado un ID de categoría
export const getSkillsBySector = (sectorId) => {
  const sector = Object.values(VACANTES_TAXONOMY).find(c => c.id === sectorId);
  return sector ? sector.skills : [];
};

// 4. Helper para mostrar el nombre bonito de un Rol en el historial
// Recibe 'MESERO' y devuelve 'Mesero / Camarero'
export const getRoleLabel = (roleId) => {
  for (const sector of Object.values(VACANTES_TAXONOMY)) {
    const role = sector.roles.find(r => r.id === roleId);
    if (role) return role.label;
  }
  return roleId; // Fallback si no encuentra
};

// 5. Generar lista plana para búsquedas (Search Bar global)
export const getAllSearchTags = () => {
  let tags = [];
  Object.values(VACANTES_TAXONOMY).forEach(sector => {
    tags.push(sector.label); // Nombre del sector
    sector.roles.forEach(r => tags.push(r.label)); // Nombres de roles
    sector.skills.forEach(s => tags.push(s.label)); // Nombres de skills
  });
  return [...new Set(tags)]; // Eliminar duplicados
};

// 6. Obtener toda la data de un rol (Marketing + ID) dado su slug
export const getRoleBySlug = (slug) => {
  for (const sector of Object.values(VACANTES_TAXONOMY)) {
    const role = sector.roles.find(r => r.slug === slug);
    if (role) return role;
  }
  return null;
};