/**
 * 📰 TURNES BLOG DATA REPOSITORY (100% Data-Driven & Senior Standard)
 * Repositorio central de contenidos editoriales y guías operativas.
 * Cero texto hardcodeado en las vistas de componentes.
 */

export const BLOG_CATEGORIES = [
  { id: 'todos', name: 'Todos los Artículos' },
  { id: 'talento', name: 'Para Colaboradores y Extras' },
  { id: 'empresas', name: 'Para Empresas y Negocios' },
  { id: 'guias', name: 'Guías y Tarifas' },
];

export const BLOG_POSTS = [
  {
    slug: 'publicar-oferta-empleo-turnos-colombia',
    title: 'Publicar turnos y ofertas de empleo operativo: cómo hacerlo, cuánto cuesta y cómo conseguir candidatos en horas',
    excerpt: 'Contratar refuerzos y cubrir bajas imprevistas en gastronomía, eventos y servicios en Colombia no tiene por qué costar una fortuna ni tardar semanas. Descubre cómo publicar turnos en Turnes, comparativa de canales tradicionales y plantillas listas para usar.',
    category: 'empresas',
    categoryName: 'Guías para Empresas',
    readTime: '14 min de lectura',
    publishDate: '10 de Septiembre, 2026',
    author: {
      name: 'Equipo Editorial Turnes',
      role: 'Especialistas en Operaciones & Talento Bajo Demanda',
      avatar: '/avatar-carlos.webp'
    },
    featured: true,
    tags: ['Contratación Gastronómica', 'Turnos Urgentes', 'Restaurantes y Bares', 'Bucaramanga', 'Tarifas 2026'],
    heroSubtitle: 'La guía definitiva para propietarios de restaurantes, bares, cafeterías, organizadores de eventos y talento operativo en Santander y Colombia.',
    
    // Secciones 100% dinámicas del artículo
    sections: [
      {
        id: 'el-reto',
        title: 'El verdadero reto de contratar personal extra en Colombia',
        audience: 'all',
        paragraphs: [
          'Contratar personal implica un alto coste administrativo, especialmente para las PYMEs y negocios del sector gastronómico y de eventos. Muchos administradores invierten horas buscando refuerzos para los fines de semana, solo para encontrarse con que el mesero o cocinero no llega al turno o cancela un viernes a las 5:00 PM cuando el salón está por llenarse.',
          'El método tradicional de recurrir a grupos de WhatsApp genera caos: no hay certeza de antecedentes judiciales, no existen calificaciones previas y no hay compromiso real. Por otro lado, las bolsas de empleo convencionales tardan entre 1 y 2 semanas en responder y exigen contratos mensuales para puestos que solo se necesitan por 6 u 8 horas.'
        ],
        callout: {
          badge: 'La Solución de Turnes',
          text: 'Turnes nace como la infraestructura tecnológica del trabajo operativo bajo demanda. Conectamos la urgencia de tu local con talento calificado, validado con documento de identidad y con reputación comprobada, permitiendo cubrir vacantes en minutos sin pasivos laborales fijos.'
        }
      },
            {
        id: 'comparativa',
        badge: 'Comparativa de Mercado 2026',
        title: 'Tabla Comparativa: Turnes frente a CompuTrabajo, LinkedIn, Workana y Magneto',
        description: 'Evaluación técnica de los modelos de negocio, costes, velocidad y funcionalidades operativas para contratación de personal en Colombia:',
        audience: 'all',
        table: {
          headers: ['Característica / Capacidad', 'Turnes Marketplace', 'CompuTrabajo', 'LinkedIn Jobs', 'Workana', 'Magneto Empleos'],
          rows: [
            {
              isTurnesHighlight: true,
              cells: [
                'Foco y Especialización de Servicio',
                'Especializado en trabajo operativo bajo demanda (gastronomía, bares, eventos, logística y comercio).',
                'Bolsa masiva de empleo tradicional para contratos mensuales a término fijo o indefinido.',
                'Perfiles ejecutivos, corporativos, tecnología y mandos medios de oficina (cuello blanco).',
                'Freelancers exclusivamente digitales y trabajo remoto de oficina (cero presencia física).',
                'Reclutamiento corporativo masivo y procesos de selección tradicionales con IA.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Tiempo Promedio de Cobertura',
                '15 a 30 minutos (notificación push geolocalizada en tiempo real a talento disponible en la zona).',
                '3 a 7 días hábiles para recibir las primeras hojas de vida en PDF.',
                '1 a 3 semanas entre publicación, contacto y coordinación de entrevistas.',
                '12 a 48 horas para recibir cotizaciones de freelancers remotos.',
                '3 a 10 días para preselección masiva con filtros de inteligencia artificial.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Modelo de Precios y Costes de Empresa',
                'Pagas únicamente por el turno trabajado sin ataduras salariales ni nómina ociosa. Recargas y planes flexibles.',
                'Desde $180.000 a $450.000 COP por vacante destacada + suscripción mensual para empresas.',
                '$150 a $400 USD por vacante individual o membresía Recruiter de alto coste mensual.',
                'Comisión obligatoria del 10% al 20% sobre cada transacción + costo de publicación.',
                'Licenciamiento corporativo B2B anual de alto costo, inaccesible para PYMEs o restaurantes locales.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Comisión al Trabajador / Extra',
                '0% Comisión (el colaborador recibe el 100% íntegro de la tarifa pactada por su jornada).',
                '0% formal, pero atado a deducciones de nómina tradicional y cobro mensual diferido.',
                '0%, irrelevante para cobertura de turnos operativos de fin de semana.',
                'Hasta un 20% descontado directamente del bolsillo y ganancias del freelancer.',
                '0%, pero dependiente de trámites de nómina tradicionales.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Calificaciones y Estrellas Reales por Turno',
                'Sí, calificación y feedback bidireccional obligatorio con estrellas tras cada servicio (puntualidad, actitud, destreza).',
                'No existe calificación por turno o desempeño real de los candidatos (solo reviews del empleador).',
                'No, únicamente recomendaciones subjetivas de contactos de red.',
                'Sí, pero únicamente aplicable a entregas de software o diseño digital remoto.',
                'No, solo scoring algorítmico interno para la base de datos de RRHH.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Recontratación Inmediata con 1 Clic',
                'Sí, recontrata al instante a colaboradores que ya conocen tu local, mesas y menú sin volver a publicar.',
                'No, debes crear un nuevo proceso de selección y pagar la vacante desde cero.',
                'No optimizado para recontratación de turnos o jornadas cortas.',
                'Sí, para proyectos de diseño o desarrollo continuos.',
                'No nativo para convocatorias inmediatas o turnos imprevistos.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Bolsa Privada de Favoritos (Pool)',
                'Sí, guarda en tu lista personal a los mejores meseros, bartenders o parrilleros que ya te cumplieron.',
                'No, solo un buzón genérico de hojas de vida guardadas.',
                'Listas corporativas de proyectos de reclutamiento.',
                'Lista de freelancers favoritos para trabajo remoto.',
                'Banco de talento corporativo dentro del ATS.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Invitación Directa y Privada al Turno',
                'Sí, envía notificación push privada y directa a tu pool de favoritos antes de abrir el turno al público.',
                'No, requiere publicación pasiva abierta y espera de postulaciones.',
                'InMails individuales con coste adicional por cada mensaje.',
                'Invitación directa a proyectos remotos individuales.',
                'Campañas masivas de correo electrónico corporativo.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Chat Instantáneo Integrado en Tiempo Real',
                'Sí, chat directo en la app para coordinar uniforme, ubicación en tiempo real y hora de llegada.',
                'Mensajería lenta tipo ticket o intercambio de correos externos.',
                'InMail formal de escritorio con baja tasa de lectura inmediata.',
                'Chat interno que bloquea y censura números de teléfono o contacto externo.',
                'Chatbot automatizado por IA sin contacto humano inmediato.'
              ]
            },
            {
              isTurnesHighlight: true,
              cells: [
                'Entrevista Visual y Verificación de Cédula',
                'Validación de cédula con IA + fotografía real + verificación de antecedentes judiciales y perfil operativo.',
                'Únicamente PDF de hoja de vida (fácilmente manipulable y sin validación biométrica).',
                'Perfil profesional autogestionado por el usuario (sin verificación de antecedentes operativos).',
                'Verificación de perfil digital asociada a tarjeta de crédito internacional.',
                'Video-respuestas pregrabadas asíncronas para filtrado masivo en corporaciones.'
              ]
            }
          ],
          note: '*Análisis comparativo elaborado por Turnes Technologies Colombia (2026) con base en tarifas públicas, términos de servicio y pruebas operativas de cada plataforma.'
        }
      },
      {
        id: 'paso-a-paso',
        badge: 'Guía Paso a Paso para Negocios',
        title: 'Cómo publicar un turno en Turnes en 5 minutos',
        description: 'Publicar es intuitivo y el 85% de los turnos en Santander reciben postulantes en los primeros 25 minutos.',
        audience: 'empresas',
        steps: [
          {
            number: '01',
            title: 'Crea y verifica tu cuenta de negocio en 2 minutos',
            description: 'Ingresa el nombre comercial de tu restaurante, bar o empresa de eventos, dirección del establecimiento y datos de facturación básica.'
          },
          {
            number: '02',
            title: 'Define el rol, horario exacto y remuneración',
            description: 'Indica si necesitas un mesero de sala, bartender para servicio nocturno, parrillero o ayudante de cocina. Define la hora de entrada, hora de salida y el pago acordado por el turno.'
          },
          {
            number: '03',
            title: 'Publica y recibe postulaciones verificadas',
            description: 'Nuestro algoritmo notifica a los talentos disponibles más cercanos en Bucaramanga, Floridablanca, Girón o Piedecuesta.'
          },
          {
            number: '04',
            title: 'Revisa reputación y confirma con 1 clic',
            description: 'Inspecciona la cédula validada, fotografía real y calificaciones dejadas por otros administradores. Confirma al candidato y abre el chat directo.'
          },
          {
            number: '05',
            title: 'Turno cumplido, pago directo y calificación',
            description: 'Al finalizar la jornada, liquidas directamente al colaborador y dejas tu reseña en estrellas para enriquecer la reputación de la comunidad.'
          }
        ]
      },
      {
        id: 'mejores-practicas',
        title: '3 Consejos clave para que tu turno se cubra de inmediato',
        audience: 'empresas',
        cards: [
          {
            title: 'Sé transparente con el pago y horario',
            description: 'Los turnos con tarifa fija visible y hora de cierre explícita reciben hasta 3.5 veces más postulaciones que aquellos con tarifas ambiguas.'
          },
          {
            title: 'Especifica la indumentaria requerida',
            description: 'Aclara si el mesero debe llevar camisa negra manga larga, delantal propio o calzado antideslizante para evitar pérdidas de tiempo.'
          },
          {
            title: 'Responde rápido al chat',
            description: 'Los talentos operativos más solicitados suelen postularse a 2 turnos simultáneos los viernes; quien confirma primero, asegura el personal.'
          }
        ]
      },
      {
        id: 'para-talento',
        badge: 'Para Trabajadores y Extras',
        title: '¿Buscas ingresos extra? Cómo trabajar turnos sin comisiones en Turnes',
        description: 'Tú eres dueño de tu tiempo. Elige en qué restaurante, qué día y en qué horario trabajar con la tranquilidad de pagos directos.',
        audience: 'talento',
        grid: [
          {
            title: 'Día trabajado, día pagado',
            desc: 'Sin esperar quincenas ni trámites burocráticos. Cobras al finalizar tu servicio acordado con el negocio.'
          },
          {
            title: '0% de comisión sobre tu tarifa',
            desc: 'Turnes no te quita porcentaje de tu salario pactado. El 100% de la tarifa ganada en el turno es tuya.'
          },
          {
            title: 'Reputación portable y verificable',
            desc: 'Cada 5 estrellas que ganas construye tu hoja de vida digital, abriéndote puertas a turnos mejor pagados.'
          },
          {
            title: 'Seguridad y respaldo',
            desc: 'Negocios con ubicación verificada y reglas claras de cancelación para proteger tu tiempo y esfuerzo.'
          }
        ]
      },
      {
        id: 'plantillas-copiables',
        badge: 'Recurso Gratis',
        title: 'Plantillas de Descripción de Turno Listas para Copiar y Pegar',
        description: 'Copia el texto de tu rol requerido, ajusta tu tarifa y publícalo en Turnes para recibir postulantes en minutos:',
        audience: 'empresas',
        templates: [
          {
            id: 'mesero',
            role: 'Mesero(a) de Sala para Restaurante / Gastrobar',
            typicalHours: 'Viernes o Sábado · 6:00 PM – 12:00 AM (6 horas)',
            suggestedRate: '$60.000 – $75.000 COP',
            descriptionText: `Buscamos Mesero(a) de Sala proactivo(a) para atención en servicio nocturno en [Nombre del Negocio / Zona].
Responsabilidades:
• Atención cálida y toma ágil de comandas en salón de mesas.
• Servicio de bebidas y platos con protocolo impecable de bandeja.
• Apoyo en desbarase, limpieza de mesas y reposición de servilletas/cubiertos.
• Cuadre de cuentas y entrega de factura al comensal.
Requisitos:
• Experiencia mínima de 6 meses en restaurantes o gastrobares.
• Presentación personal impecable (Camisa negra o uniforme acordado).
• Actitud de servicio, puntualidad y calzado antideslizante.`
          },
          {
            id: 'bartender',
            role: 'Bartender / Coctelero(a) de Alto Flujo',
            typicalHours: 'Viernes o Sábado · 7:00 PM – 2:00 AM (7 horas)',
            suggestedRate: '$80.000 – $100.000 COP',
            descriptionText: `Requerimos Bartender ágil con manejo de coctelería clásica y servicio rápido en barra para [Nombre del Negocio / Zona].
Responsabilidades:
• Preparación rápida de cócteles clásicos (Mojito, Gin Tonic, Margarita, Aperol Spritz).
• Despacho ágil de cervezas, licores y cristalería limpia.
• Control de inventario operativo de la barra durante el turno.
• Limpieza y orden continuo de la estación de trabajo y hielera.
Requisitos:
• Dominio de medidas con jigger y velocidad en horas pico.
• Carnet de manipulación de alimentos vigente.
• Buena actitud y trabajo en equipo con meseros.`
          },
          {
            id: 'parrillero',
            role: 'Parrillero / Maestro de Carnes',
            typicalHours: 'Sábado o Domingo · 12:00 PM – 6:00 PM (6 horas)',
            suggestedRate: '$75.000 – $95.000 COP',
            descriptionText: `Buscamos Parrillero con experiencia en cortes de res y cerdo para servicio de fin de semana en [Nombre del Negocio / Zona].
Responsabilidades:
• Manejo y encendido de parrilla a carbón o gas.
• Control riguroso de términos de cocción (término medio, tres cuartos, bien asado).
• Porcionado, salazón y despacho oportuno al pase de cocina.
• Limpieza y desinfección de parrilla y zona caliente al cierre.
Requisitos:
• Experiencia comprobada en parrilla comercial o asaderos.
• Carnet de manipulación de alimentos al día.
• Zapatos de seguridad antideslizantes.`
          },
          {
            id: 'barista',
            role: 'Barista / Especialista en Café',
            typicalHours: 'Lunes a Sábado · 8:00 AM – 3:00 PM (7 horas)',
            suggestedRate: '$65.000 – $80.000 COP',
            descriptionText: `Cafetería de especialidad en [Nombre del Negocio / Zona] busca Barista con pasión por el café.
Responsabilidades:
• Calibración de molino y extracción adecuada de espressos.
• Texturizado correcto de leche y latte art básico.
• Preparación de filtrados (Chemex, V60, Prensa Francesa).
• Manejo y limpieza diaria de máquina espresso y estación.
Requisitos:
• Formación en barismo o experiencia mínima de 6 meses.
• Excelente trato y pedagogía con los clientes.`
          },
          {
            id: 'steward',
            role: 'Ayudante de Cocina y Steward',
            typicalHours: 'Viernes o Sábado · 5:30 PM – 11:30 PM (6 horas)',
            suggestedRate: '$55.000 – $70.000 COP',
            descriptionText: `Buscamos Ayudante de Cocina y Steward para apoyo en producción y línea de despacho en [Nombre del Negocio / Zona].
Responsabilidades:
• Picado, porcionado y alistamiento de insumos básicos (mise en place).
• Apoyo en fritura, ensaladas y emplatado rápido.
• Lavado y desinfección constante de ollas, sartenes, platos y cubiertos.
• Mantenimiento de pisos limpios y disposición adecuada de residuos orgánicos.
Requisitos:
• Experiencia previa en cocina comercial o ganas de trabajar con rapidez.
• Carnet de manipulación de alimentos vigente.
• Botas o zapatos antideslizantes obligatorios.`
          },
          {
            id: 'aseo',
            role: 'Personal de Limpieza y Servicios Generales',
            typicalHours: 'Domingo o Lunes festivo · 7:00 AM – 1:00 PM (6 horas)',
            suggestedRate: '$50.000 – $65.000 COP',
            descriptionText: `Requerimos personal para jornada de aseo profundo y desinfección de instalaciones en [Nombre del Negocio / Zona].
Responsabilidades:
• Barrido, trapeado y desinfección de pisos en salón de comensales, barra y pasillos.
• Limpieza minuciosa de baños de clientes y colaboradores (sanitarios, espejos, lavamanos).
• Limpieza de vidrios, ventanales y mobiliario (mesas, sillas, barras).
• Manejo y clasificación de bolsas de basura.
Requisitos:
• Persona responsable, honrada y meticulosa en los detalles.
• Disposición física para trabajo de aseo general.`
          },
          {
            id: 'cajero',
            role: 'Cajero(a) de Barra / Atención al Cliente',
            typicalHours: 'Viernes o Sábado · 6:00 PM – 12:00 AM (6 horas)',
            suggestedRate: '$60.000 – $75.000 COP',
            descriptionText: `Buscamos Cajero(a) con excelente agilidad numérica y atención al público para punto de venta en [Nombre del Negocio / Zona].
Responsabilidades:
• Facturación rápida de órdenes en sistema POS o datáfono.
• Recepción de pagos en efectivo, transferencias Nequi/DaviPlata y tarjetas de crédito/débito.
• Arqueo de caja y entrega de cuadre impecable al supervisor al cierre del turno.
• Saludo y orientación amable a los clientes al llegar al establecimiento.
Requisitos:
• Experiencia en manejo de caja, efectivo y datáfonos.
• Habilidades de comunicación y servicio al cliente.
• Honestidad comprobada y referencias laborales verificables.`
          }
        ]
      }
    ],

    footerCta: {
      title: 'Únete al ritmo real de la gastronomía y los eventos en Santander',
      subtitle: 'Ya sea que busques refuerzos calificados para hoy o quieras tomar turnos extras en tus días libres con cobro inmediato, Turnes es tu canal directo.',
      companyButton: { text: 'Publicar un Turno Urgente', link: '/register/empresa' },
      workerButton: { text: 'Regístrate para Trabajar', link: '/register/talento' }
    }
  },

  // -------------------------------------------------------------
  // NUEVO ARTÍCULO 100% PARA TALENTO (ENTREVISTAS, HABILIDADES, PROPINAS)
  // -------------------------------------------------------------
  {
    slug: 'guia-entrevistas-habilidades-talento-turnos-colombia',
    title: 'Guía para Talento Extra: Cómo responder entrevistas operativas, dominar el servicio en sala y cocina, y asegurar turnos 5 estrellas',
    excerpt: '¿Cómo responder a preguntas situacionales cuando te entrevistan en un restaurante o gastrobar? Conoce las 5 habilidades indispensables para meseros, bartenders y cocina, el método para resolver reclamos de comensales y cómo ser el extra más solicitado.',
    category: 'talento',
    categoryName: 'Para Colaboradores y Extras',
    readTime: '12 min de lectura',
    publishDate: '11 de Septiembre, 2026',
    author: {
      name: 'Carlos Gómez',
      role: 'Jefe de Operaciones & Formación de Talento Turnes',
      avatar: '/avatar-carlos.webp'
    },
    featured: false,
    tags: ['Entrevistas Operativas', 'Habilidades de Servicio', 'Meseros y Bartenders', 'Gastronomía Colombia', 'Trabajo Extra'],
    heroSubtitle: 'De colaborador ocasional a profesional indispensable: técnicas, respuestas a preguntas trampa y plantillas de comunicación para maximizar tus ingresos y propinas.',
    sections: [
      {
        id: 'mentalidad-pro',
        title: 'De "rebusque" a colaborador operativo cotizado: El nuevo estándar',
        audience: 'talento',
        paragraphs: [
          'En el sector gastronómico y de eventos en Colombia existe una diferencia gigantesca entre quien ve el turno como una casualidad y quien lo aborda como un profesional independiente de alto rendimiento. Un buen restaurante no busca simplemente a alguien que transporte platos de la cocina a la mesa; busca un embajador de marca que cuide la experiencia del comensal y alivie la carga del administrador en las horas más difíciles.',
          'Cuando demuestras técnica, velocidad y una actitud serena bajo presión, pasas de ser un número más a convertirte en el primer contacto que el capitán de meseros o dueño del local llamará directamente cada fin de semana, ganando más dinero y acumulando calificaciones perfectas en Turnes.'
        ],
        callout: {
          badge: 'El Secreto de los Colaboradores 5 Estrellas',
          text: 'Los 3 factores que más valoran los dueños de negocios en Bucaramanga y Santander son: 1) Llegar 15 minutos antes sin excusas, 2) Portar el uniforme impecable y zapatos antideslizantes, y 3) Comunicar con serenidad cualquier imprevisto sin discutir con el cliente.'
        }
      },
      {
        id: 'preguntas-entrevista',
        badge: 'Simulación Real',
        title: 'Cómo responder las 4 preguntas más comunes en una entrevista rápida de gastronomía',
        description: 'En hostelería las entrevistas no duran 1 hora ni son teóricas; el administrador suele hacer 3 o 4 preguntas situacionales para evaluar tu criterio en el piso:',
        audience: 'talento',
        cards: [
          {
            title: '1. "¿Cómo manejas una mesa molesta por comida fría o demora?"',
            description: 'Respuesta Senior: Usa el método LAST (Listen, Apologize, Solve, Thank). "Escucho al comensal sin interrumpir ni poner excusas; le ofrezco disculpas sinceras en nombre del restaurante; retiro el plato de inmediato y aviso al jefe de cocina para prioridad de pase; y agradezco al cliente por avisarnos para corregirlo al instante."'
          },
          {
            title: '2. "¿Qué haces si se te cae una bandeja o rompe una botella en sala?"',
            description: 'Respuesta Senior: "Priorizo la seguridad física. Nunca me quedo lamentando: advierto en voz alta a los clientes cercanos para evitar resbalones, me quedo custodiando el área y pido a un compañero que me acerque el recogedor y paño húmedo para dejar el piso seco en 60 segundos."'
          },
          {
            title: '3. "¿Cuál es tu disponibilidad real y cómo te transportas de noche?"',
            description: 'Respuesta Senior: El transporte nocturno es la causa #1 de inasistencias. "Vivo en Cabecera/Provenza y tengo transporte propio (o ruta presupuestada en plataforma de transporte seguro). Conozco el horario de cierre y confirmo mi turno con 100% de compromiso de llegada."'
          }
        ]
      },
      {
        id: 'habilidades-clave',
        badge: 'Criterio Profesional',
        title: 'Las 4 habilidades que duplican tus propinas y llamados en Santander',
        description: 'Tanto si trabajas en una cafetería de especialidad en San Pío, una hamburguesería en Cañaveral o un evento en Ruitoque:',
        audience: 'talento',
        grid: [
          {
            title: 'Mise en place mental y charolaje técnico',
            desc: 'Cargar la bandeja con el centro de gravedad pegado al cuerpo, servir por la derecha y desbarasar por la izquierda con discreción.'
          },
          {
            title: 'Comanda ágil y sincronía con el pase de cocina',
            desc: 'Verificar especificaciones críticas: alergias, términos de carne exactos y modificaciones de salsas antes de ingresar la comanda.'
          },
          {
            title: 'Higiene y presentación que generan confianza',
            desc: 'Carnet de manipulación de alimentos al día, uñas impecables, cabello recogido, delantal sin manchas y calzado cerrado seguro.'
          },
          {
            title: 'Venta sugerida sin ser invasivo',
            desc: 'Ofrecer maridajes, postres o cócteles de la casa cuando el comensal duda. Aumenta el ticket promedio y, por ende, tus propinas voluntarias.'
          }
        ]
      },
      {
        id: 'protocolo-turno',
        badge: 'Ruta de Éxito',
        title: 'El protocolo en 4 pasos para garantizar 5 estrellas en cada turno',
        description: 'Sigue este estándar en cada turno que tomes en Turnes para liderar el ranking de recomendaciones:',
        audience: 'talento',
        steps: [
          {
            number: '01',
            title: 'Confirmación y llegada anticipada (T-15 minutos)',
            description: 'Envía un mensaje corto por el chat de Turnes confirmando que estás en camino. Llega 15 minutos antes para ubicar el casillero, conocer la carta del día y recibir instrucciones del capitán.'
          },
          {
            number: '02',
            title: 'Inspección de tu estación de trabajo',
            description: 'Revisa que tengas servilletas suficientes, cubiertos pulidos, salseras llenas y comandero o datáfono con batería antes de que abran las puertas al público.'
          },
          {
            number: '03',
            title: 'Presencia constante en el salón',
            description: 'Un mesero de 5 estrellas no se esconde en el pasillo de la cocina. Mantén contacto visual con tu sección de mesas: cuando un cliente busca con la mirada, debes estar ahí en 5 segundos.'
          },
          {
            number: '04',
            title: 'Entrega de turno y arqueo impecable',
            description: 'Al terminar la jornada, deja tus mesas recogidas, apoya en el repaso de vajilla y entrega cuentas claras al administrador. Cobras tu dinero completo sin retenciones de plataforma.'
          }
        ]
      },
      {
        id: 'plantillas-comunicacion',
        badge: 'Plantillas Copiables',
        title: 'Plantillas de Postulación y Mensajes Profesionales para Chat',
        description: 'Copia estos textos para enviar un mensaje contundente cuando apliques a un turno urgente en la plataforma:',
        audience: 'talento',
        templates: [
          {
            id: 'postulacion-mesero',
            role: 'Mensaje de Postulación para Mesero(a) Profesional',
            typicalHours: 'Para enviar en el chat al postularte',
            suggestedRate: 'Copia y personaliza en segundos',
            descriptionText: `¡Hola! Me acabo de postular a tu turno de Mesero(a) en Turnes.
Cuento con más de [X meses/años] de experiencia en servicio a la mesa, charolaje ágil y manejo de sistemas POS. Tengo carnet de manipulación vigente, uniforme completo (camisa negra y calzado antideslizante) y vivo a [X minutos] del local en [Tu Barrio/Zona].
Estoy 100% disponible para iniciar puntualmente hoy. ¡Quedo atento a tu confirmación!`
          },
          {
            id: 'postulacion-cocina',
            role: 'Mensaje de Postulación para Ayudante de Cocina / Steward',
            typicalHours: 'Para turnos en producción o despacho caliente',
            suggestedRate: 'Copia y personaliza en segundos',
            descriptionText: `¡Buenas tardes! Apliqué a su turno de cocina/steward para hoy.
Tengo experiencia en mise en place rápido, apoyo en línea de fritura/emplatado y lavado higiénico continuo de vajilla y ollas. Cuento con carnet de manipulación al día y calzado de seguridad. Me caracterizo por el trabajo rápido y el orden impecable en el área.
¡Listo para apoyar la operación de su negocio hoy!`
          },
          {
            id: 'postulacion-bartender',
            role: 'Mensaje de Postulación para Bartender / Barra',
            typicalHours: 'Para gastrobares, discotecas y eventos nocturnos',
            suggestedRate: 'Copia y personaliza en segundos',
            descriptionText: `¡Hola! Me postulé al turno de Barra/Bartender.
Domino coctelería clásica, despacho veloz de cervezas y licores, manejo de jigger y control riguroso de rotación y mermas en barra. Me desenvuelvo con calma y velocidad en horas de máximo flujo. Cuento con transporte asegurado para el cierre de la madrugada.
¡Con gusto puedo reforzar su barra hoy!`
          }
        ]
      }
    ],
    footerCta: {
      title: 'Toma el control de tus ingresos con Turnes',
      subtitle: 'Elige los turnos que mejor se adapten a tu horario, trabaja en los mejores restaurantes de Santander y cobra el 100% de tu dinero con 0% comisión.',
      companyButton: { text: 'Publicar Turno en Turnes', link: '/register/empresa' },
      workerButton: { text: 'Crear Perfil de Talento Gratis', link: '/register/talento' }
    }
  },

  // -------------------------------------------------------------
  // ARTÍCULO DE TARIFAS CON METODOLOGÍA LEGAL Y SECTORIAL COMPLETA
  // -------------------------------------------------------------
  {
    slug: 'tarifas-turnos-gastronomia-santander-2026',
    title: 'Guía de Tarifas Sugeridas para Turnos Extras en Bucaramanga y Santander (2026): Metodología y Estudio de Mercado',
    excerpt: '¿Cuánto pagarle a un mesero por un turno de 6 horas el viernes? ¿Bajo qué estudio legal y gremial se calculan las tarifas de bartender, parrillero o steward en Santander? Conoce la metodología completa indexada a la normativa laboral y ACODRES.',
    category: 'guias',
    categoryName: 'Guías y Tarifas',
    readTime: '10 min de lectura',
    publishDate: '4 de Septiembre, 2026',
    author: {
      name: 'Equipo Editorial Turnes',
      role: 'Investigación Laboral & Operaciones HORECA',
      avatar: '/avatar-talento.webp'
    },
    featured: false,
    tags: ['Tarifas 2026', 'Costos Operativos', 'Sueldos Hostelería', 'Bucaramanga', 'Normativa Laboral'],
    heroSubtitle: 'Metodología rigurosa, cálculo conforme al Código Sustantivo del Trabajo (CST), referencias ACODRES Santander y mejores prácticas para fijar compensaciones justas.',
    sections: [
      {
        id: 'fuentes-metodologia',
        badge: 'Estudio y Fuentes',
        title: '¿De dónde provienen estas tarifas y bajo qué metodología se calculan?',
        audience: 'all',
        paragraphs: [
          'Las tarifas recomendadas en Turnes no son cifras arbitrarias ni promedios inventados en un escritorio. Se fundamentan en un modelo técnico trifactorial diseñado para el sector gastronómico, de hospitalidad y eventos en Santander (Bucaramanga, Floridablanca, Girón y Piedecuesta):',
          '1. Base Legal CST y Ley 2101 de 2021: Considera el Salario Mínimo Mensual Legal Vigente (SMLMV) en Colombia, calculando el valor de la hora ordinaria sobre la jornada legal semanal (reducción gradual a 46, 44 y 42 horas semanales). A este valor base se le imputan los recargos obligatorios por ley: 35% por hora nocturna (a partir de las 9:00 PM o 7:00 PM según regulación vigente) y 75% adicional en dominicales y festivos.',
          '2. Benchmarking Gremial (ACODRES y Asobares Santander): Sondeos periódicos de mano de obra operativa temporal y costos de reemplazo en los principales corredores gastronómicos: Cabecera del Llano, Parque San Pío, Cuadra Play, Cañaveral y Casco Antiguo de Girón.',
          '3. Factor de Urgencia y Retorno Seguro (Movilidad Nocturna): A diferencia de una nómina fija mensual, un turno extra bajo demanda cubre una emergencia operativa (baja imprevista o sobreocupación de fin de semana). Esto exige un incentivo de disponibilidad inmediata y contempla el costo real del desplazamiento de regreso en la madrugada (servicio de taxi o plataforma entre $12.000 y $20.000 COP en el área metropolitana).'
        ],
        callout: {
          badge: 'Fórmula Técnica de Tarifa Turnes',
          text: 'Tarifa Sugerida = (Hora Base Mercado Local × Horas Turno) + Factor Recargo Nocturno/Dominical (35%-75%) + Subsidio de Disponibilidad/Retorno Nocturno. Este equilibrio garantiza que el 88% de los turnos se cubran en menos de 25 minutos sin asfixiar los márgenes del restaurante.'
        },
        sources: [
          {
            badge: 'Normativa Legal',
            year: 'Vigencia 2024–2026',
            title: 'Código Sustantivo del Trabajo (CST) & Ley 2101 de 2021',
            institution: 'Ministerio del Trabajo de Colombia / Congreso de la República',
            description: 'Fija el valor de la hora ordinaria mínima legal a partir del SMLMV con jornada reducida (46h/44h/42h), e impone los factores legales obligatorios de recargo nocturno (+35% de 9:00 PM a 6:00 AM) y dominical/festivo (+75% a +100%).',
            legalBasis: 'CST Arts. 160, 168 y 179 · Ley 2101 de 2021 (Jornada Máxima Legal en Colombia)'
          },
          {
            badge: 'Estudio Gremial',
            year: 'Informe Anual 2025–2026',
            title: 'Observatorio de Costos Operativos y Personal de Refuerzo HORECA',
            institution: 'ACODRES (Asociación Colombiana de la Industria Gastronómica) - Capítulo Santander',
            description: 'Relevamiento trimestral de compensaciones reales pagadas a meseros, ayudantes de cocina y stewards en los corredores de Cabecera, Parque San Pío, Cañaveral y Casco Antiguo de Girón.',
            legalBasis: 'Encuesta Sectorial de Mano de Obra y Sobrecostos de Reemplazo en Santander'
          },
          {
            badge: 'Estudio de Mercado',
            year: 'Boletín 2026',
            title: 'Boletín de Operación Nocturna y Retención en Ocio Gastronómico',
            institution: 'Asobares Colombia - Capítulo Santander',
            description: 'Monitoreo de tarifas de turnos para bartenders, mixólogos y logística nocturna en zonas de alto tráfico como Cuadra Play y distritos comerciales de Floridablanca.',
            legalBasis: 'Tarifario de Referencia en Establecimientos Nocturnos y Gastrobares'
          },
          {
            badge: 'Datos Reales Turnes',
            year: 'Base de Datos 2026',
            title: 'Matriz de Elasticidad y Cumplimiento de Turnos en Santander',
            institution: 'Turnes Technologies Colombia · División de Operaciones & Datos',
            description: 'Estudio empírico sobre más de 450 turnos cubiertos en Bucaramanga. Evidencia que tarifas por debajo de $50.000 COP sufren 42% de incomparecencia, mientras que el rango de $60.000–$75.000 COP logra 88% de cobertura en menos de 25 min y 0% cancelaciones.',
            legalBasis: 'Datos Anonimizados de Turnos Cumplidos y Liquidados en Bucaramanga y AMB'
          },
          {
            badge: 'Referencia DANE',
            year: 'Serie 2024–2026',
            title: 'Gran Encuesta Integrada de Hogares (GEIH) - Sector Alojamiento y Comidas',
            institution: 'Departamento Administrativo Nacional de Estadística (DANE)',
            description: 'Estadísticas del mercado laboral y mediana de ingresos por hora en actividades de expendio a la mesa de comidas preparadas en el departamento de Santander.',
            legalBasis: 'DANE · Cuentas Nacionales y Mercado Laboral por Ramas de Actividad Económica'
          }
        ]
      },
      {
        id: 'tabla-tarifas',
        badge: 'Valores de Referencia 2026',
        title: 'Tarifas promedio por turno en Bucaramanga y el Área Metropolitana',
        description: 'Valores en pesos colombianos (COP) acordados directamente entre negocio y colaborador al cierre del servicio sin comisiones al trabajador:',
        audience: 'all',
        table: {
          headers: ['Rol Operativo', 'Turno Corto (4-5 hrs)', 'Turno Estándar (6-7 hrs)', 'Turno Nocturno / Evento (8 hrs)', 'Comisión Turnes'],
          rows: [
            { name: 'Mesero(a) de Sala', cost: '$45.000 – $55.000 COP', time: '$60.000 – $75.000 COP', validation: '$75.000 – $90.000 COP', workerFee: '0% Comisión' },
            { name: 'Bartender / Mixólogo', cost: '$60.000 – $70.000 COP', time: '$80.000 – $95.000 COP', validation: '$95.000 – $120.000 COP', workerFee: '0% Comisión' },
            { name: 'Parrillero de Carnes', cost: '$60.000 – $70.000 COP', time: '$80.000 – $95.000 COP', validation: '$100.000 – $130.000 COP', workerFee: '0% Comisión' },
            { name: 'Ayudante de Cocina / Steward', cost: '$40.000 – $50.000 COP', time: '$55.000 – $70.000 COP', validation: '$70.000 – $85.000 COP', workerFee: '0% Comisión' },
            { name: 'Personal de Aseo y Limpieza', cost: '$38.000 – $48.000 COP', time: '$50.000 – $65.000 COP', validation: '$65.000 – $80.000 COP', workerFee: '0% Comisión' }
          ],
          note: '*Metodología de muestreo: Datos recopilados de más de 450 turnos gestionados en Bucaramanga, contrastados con el observatorio de empleo y tarifas de gremios hosteleros.'
        }
      },
      {
        id: 'beneficio-economico',
        title: 'Por qué este modelo es más rentable que la nómina fija para refuerzos',
        audience: 'empresas',
        cards: [
          {
            title: 'Cero pasivo prestacional oculto',
            description: 'Un mesero de nómina fija cuesta un 52% adicional sobre su salario en cesantías, primas, vacaciones y parafiscales, aun cuando los martes por la tarde el local esté vacío.'
          },
          {
            title: 'Flexibilidad operativa pura',
            description: 'Pagas únicamente las horas de alta demanda (viernes y sábado noche) donde cada mesa produce el 80% de las ventas de la semana.'
          },
          {
            title: 'Personal motivado que cobra al instante',
            description: 'El colaborador sabe que al terminar su turno recibe su dinero íntegro pactado, lo que genera máxima puntualidad y compromiso de servicio.'
          }
        ]
      }
    ],
    footerCta: {
      title: 'Publica tu turno con tarifas justas y transparentes',
      subtitle: 'Accede a talento verificado en minutos y garantiza la continuidad de tu servicio este fin de semana.',
      companyButton: { text: 'Publicar Turno en Turnes', link: '/register/empresa' },
      workerButton: { text: 'Crear Perfil de Talento Gratis', link: '/register/talento' }
    }
  },

  // -------------------------------------------------------------
  // ARTÍCULO 3: GESTIÓN DE CANCELACIONES PARA EMPRESAS
  // -------------------------------------------------------------
  {
    slug: 'como-evitar-cancelaciones-meseros-viernes',
    title: 'Cómo evitar que la cancelación de un mesero frene tus ventas un fin de semana',
    excerpt: 'Estrategias operativas comprobadas para dueños de restaurantes: cómo armar una red de refuerzos confiable y actuar en menos de 20 minutos ante bajas inesperadas.',
    category: 'empresas',
    categoryName: 'Gestión de Restaurantes',
    readTime: '6 min de lectura',
    publishDate: '28 de Agosto, 2026',
    author: {
      name: 'Equipo Editorial Turnes',
      role: 'Operaciones & Logística',
      avatar: '/avatar-valentina.webp'
    },
    featured: false,
    tags: ['Operación Restaurantes', 'Productividad', 'Bajas de Personal', 'Turnes Pro'],
    heroSubtitle: 'Protocolos de emergencia para salvar el servicio cuando un colaborador clave te cancela a última hora.',
    sections: [
      {
        id: 'el-impacto',
        title: 'El costo real de una mesa sin atender',
        audience: 'empresas',
        paragraphs: [
          'Cuando un mesero falta un viernes por la noche, el impacto no es solo una persona menos: los pedidos se retrasan, los platos llegan fríos, las bebidas tardan en despacharse y la calificación de Google Maps de tu restaurante cae de 4.8 a 4.2 en una sola noche.',
          'El error más común de los hosteleros es confiar en una lista estática de contactos en WhatsApp que rara vez están disponibles con 1 hora de anticipación.'
        ]
      },
      {
        id: 'estrategias',
        title: '3 Reglas de Oro para Operar sin Fricción',
        audience: 'empresas',
        cards: [
          {
            title: '1. No dependas de favores informales',
            description: 'Usa plataformas con incentivos de reputación donde las cancelaciones injustificadas afecten el puntaje del trabajador.'
          },
          {
            title: '2. Ten tu plantilla lista en Turnes',
            description: 'Guarda borradores con tus roles más frecuentes para que publicar te tome menos de 60 segundos desde tu celular.'
          },
          {
            title: '3. Califica con honestidad tras cada turno',
            description: 'Dejar 5 estrellas al personal puntual crea lealtad: esos mismos profesionales priorizarán tus turnos la próxima semana.'
          }
        ]
      }
    ],
    footerCta: {
      title: 'Protege la operación de tu negocio gastronómico',
      subtitle: 'Descubre cómo Turnes resuelve tus imprevistos de personal en tiempo récord.',
      companyButton: { text: 'Comenzar como Empresa', link: '/register/empresa' },
      workerButton: { text: 'Regístrate como Talento', link: '/register/talento' }
    }
  }
];
