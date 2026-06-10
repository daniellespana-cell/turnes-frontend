
// === IMPORTACIONES REALES ===
// Se omite CtaSection y Aviso Legal según solicitud anterior.

// =====================================================================
// === ANIMACIONES (Framer Motion) ===
// =====================================================================

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

// =====================================================================
// === VARIABLES DE DISEÑO (Fondo Negro Total) ===
// =====================================================================

const brandPrimary = 'cyan-400'; // Cambio de color de acento a cyan para diferenciar de otras políticas
const cardColor    = 'black';         // Fondo de la tarjeta: NEGRO TOTAL
const cardTextColor = 'zinc-200';      // Texto claro
const mutedText     = 'zinc-400';


// Helper Componente para el contenido de los términos (aplica animación)
const PolicyContent = ({ id, title, children }) => (
    <motion.section
        id={id}
        className="mb-10 pt-4 scroll-mt-24"
        variants={fadeInUp}
    >
        {/* Títulos de sección: color de acento sobre separador oscuro */}
        <h2 className={`text-2xl font-bold border-b border-zinc-800/30 pb-2 text-${brandPrimary}`}>
            {title}
        </h2>
        <div className={`mt-4 text-${cardTextColor}`}>{children}</div>
    </motion.section>
);


// =====================================================================
// === COMPONENTE PRINCIPAL: POLÍTICA DE USUARIOS ===
// =====================================================================

const PoliticaUsuarios = () => {
    return (
        // Fondo general NEGRO TOTAL (bg-black)
        <div className="min-h-screen flex flex-col bg-black text-white font-sans">

            <div className="flex-grow pt-8 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- HERO HEADER --- */}
                    <motion.header
                        className="text-center mb-16 pt-8 pb-4"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-base font-semibold text-cyan-400 tracking-wide uppercase mb-3">
                            Guía de Convivencia y Conducta
                        </h2>

                        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
                            Política de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                                Usuarios de Turnes
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Nuestras normas garantizan un entorno de trabajo digital seguro, respetuoso y profesional
                            para todos los Trabajadores y Empresas.
                        </p>
                    </motion.header>

                    {/* DOCUMENTO LEGAL - CUERPO CENTRAL NEGRO (bg-black) */}
                    <motion.div
                        className={`max-w-4xl mx-auto bg-${cardColor} text-${cardTextColor} p-6 sm:p-10 rounded-xl`}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {/* Título interno del documento */}
                        <div className="pb-4 mb-8 border-b border-zinc-800/30">
                            <h2 className="text-3xl font-bold text-white">Reglas de Interacción</h2>
                            <p className={`text-sm text-${mutedText} mt-1`}>Versión 1.0 | Publicada: 1 de octubre de 2025</p>
                        </div>

                        {/* 1. Introducción y Ámbito de Aplicación */}
                        <PolicyContent id="p1" title="1. Introducción y Ámbito de Aplicación">
                            <p>Esta Política de Usuarios complementa los Términos de Servicio y la Política de Privacidad de Turnes. Aplica a todos los usuarios (Empresas y Trabajadores) que interactúan dentro de la Plataforma o en el contexto de un turno contratado a través de ella.</p>
                        </PolicyContent>

                        {/* 2. Principios de Conducta General */}
                        <PolicyContent id="p2" title="2. Principios de Conducta General">
                            <p>Todos los usuarios deben mantener una conducta basada en:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li><span className="font-semibold text-white">Respeto Mutuo:</span> Prohibición de lenguaje ofensivo, discriminación o acoso por cualquier motivo.</li>
                                <li><span className="font-semibold text-white">Profesionalismo:</span> Cumplir con los compromisos de horarios y calidad del servicio acordado en el turno.</li>
                                <li><span className="font-semibold text-white">Veracidad:</span> Toda la información proporcionada en perfiles, turnos y comunicaciones debe ser fidedigna.</li>
                            </ul>
                        </PolicyContent>

                        {/* 3. Compromisos del Trabajador */}
                        <PolicyContent id="p3" title="3. Compromisos del Trabajador">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                                <li><span className="font-semibold text-white">Puntualidad:</span> Presentarse a la hora y lugar acordado o avisar con la debida antelación ante cualquier retraso.</li>
                                <li><span className="font-semibold text-white">Calidad del Servicio:</span> Realizar las tareas asignadas según la descripción del turno y los estándares profesionales esperados.</li>
                                <li><span className="font-semibold text-white">Responsabilidad:</span> Responder por los daños causados por negligencia o dolo durante la prestación del servicio.</li>
                            </ul>
                        </PolicyContent>

                        {/* 4. Compromisos de la Empresa */}
                        <PolicyContent id="p4" title="4. Compromisos de la Empresa">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                                <li><span className="font-semibold text-white">Seguridad:</span> Garantizar un entorno de trabajo seguro y libre de riesgos para el Trabajador.</li>
                                <li><span className="font-semibold text-white">Claridad:</span> Proporcionar instrucciones claras y recursos necesarios para la ejecución del turno.</li>
                                <li><span className="font-semibold text-white">Pago:</span> Realizar el pago total y oportuno del turno a través de la Plataforma de Turnes, una vez finalizado el servicio.</li>
                            </ul>
                        </PolicyContent>

                        {/* 5. Uso Prohibido y Evasión de la Plataforma (Anti-Fuga) */}
                        <PolicyContent id="p5" title="5. Uso Prohibido y Evasión de la Plataforma (Anti-Fuga)">
                            <p>Para proteger la integridad de la comunidad y el modelo de negocio, se prohíbe estrictamente:</p>
                            <div className="mt-3 p-4 bg-red-900/10 rounded-lg border border-red-900/20">
                                <p className="font-semibold text-red-300 flex items-center gap-2">
                                    <Zap size={18} className="flex-shrink-0" /> EVASIÓN DE COMISIONES (ANTI-FUGA):
                                </p>
                                <p className="text-sm mt-1">
                                    Intentar contratar, acordar, o realizar pagos por fuera de la Plataforma por turnos que hayan sido originados o contactados inicialmente a través de Turnes.
                                </p>
                                <p className="text-sm mt-2 font-medium">
                                    Esta infracción resultará en la inmediata y permanente suspensión de ambas cuentas.
                                </p>
                            </div>
                            <p className="mt-4">Otras actividades prohibidas incluyen el fraude, el envío de contenido ilegal o la suplantación de identidad.</p>
                        </PolicyContent>

                        {/* 6. Sistema de Reputación y Reseñas */}
                        <PolicyContent id="p6" title="6. Sistema de Reputación y Reseñas">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                                <li><span className="font-semibold text-white">Objetividad:</span> Las calificaciones y reseñas deben ser justas, objetivas y reflejar la experiencia real del turno.</li>
                                <li><span className="font-semibold text-white">Prohibición de Manipulación:</span> Está prohibido crear reseñas falsas, publicar reseñas sobre turnos no realizados o intentar extorsionar a otros usuarios con calificaciones.</li>
                                <li><span className="font-semibold text-white">Eliminación:</span> Turnes se reserva el derecho de eliminar reseñas que sean difamatorias, obscenas o que violen esta política.</li>
                            </ul>
                        </PolicyContent>

                        {/* 7. Incumplimiento y Sanciones */}
                        <PolicyContent id="p7" title="7. Incumplimiento y Sanciones">
                            <p>El incumplimiento de esta Política de Usuarios o de los Términos de Servicio puede conllevar las siguientes acciones:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Advertencia o Amonestación formal.</li>
                                <li>Suspensión temporal de la cuenta.</li>
                                <li>Eliminación o cancelación definitiva de la cuenta y los perfiles asociados, especialmente en casos de fraude o evasión de la plataforma.</li>
                                <li>Retención de pagos pendientes de procesamiento en caso de investigaciones por fraude.</li>
                            </ul>
                        </PolicyContent>

                        {/* 8. Contacto y Reporte de Violaciones */}
                        <PolicyContent id="p8" title="8. Contacto y Reporte de Violaciones">
                            <p>Si observas o eres víctima de una violación a esta Política, repórtalo inmediatamente a nuestro equipo.</p>
                            <div className="mt-3 p-3 bg-zinc-900/10 rounded-lg border border-zinc-800/20">
                                <p className="font-semibold text-gray-300 flex items-center gap-2">
                                    <MessageSquare size={18} /> Canal de Reporte:
                                </p>
                                <p className="text-sm mt-1">
                                    Envía un correo electrónico detallado a:
                                    <a
                                        href="mailto:soporte@turnes.com"
                                        className={`text-${brandPrimary} hover:text-cyan-300 ml-1`}
                                    >
                                        soporte@turnes.com
                                    </a>
                                </p>
                            </div>
                        </PolicyContent>


                        {/* 9. Versión Oficial del Documento */}
                        <PolicyContent id="p9" title="9. Versión y Publicación Oficial">
                            <p className="font-semibold text-white">
                                Versión del Documento: 1.0 – Publicada el 1 de octubre de 2025.
                            </p>
                            <p className="mt-1">
                                Esta es la versión oficial y vigente de la Política de Usuarios de Turnes.
                            </p>
                        </PolicyContent>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PoliticaUsuarios;