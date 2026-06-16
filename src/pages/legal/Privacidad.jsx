import React from 'react';
import { motion } from 'framer-motion';
import { Info, Shield, Clock } from 'lucide-react';
import CtaSection from '../../components/common/CtaSection';


// === IMPORTACIONES REALES ===

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

const brandPrimary = 'indigo-400';
const cardColor    = 'black';         // Fondo de la tarjeta: NEGRO TOTAL
const cardTextColor = 'zinc-200';      // Texto claro
const mutedText     = 'zinc-400';


// Helper Componente para el contenido de la política (aplica animación)
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
// === COMPONENTE PRINCIPAL: POLITICA DE PRIVACIDAD ===
// =====================================================================

const PoliticaPrivacidad = () => {
    return (
        // Fondo general NEGRO TOTAL (bg-black)
        <div className="min-h-screen flex flex-col bg-black text-white font-sans">

            <div className="flex-grow pt-8 pb-20">
                {/* Adjusted padding to pt-10. See TerminosServicio rationale. */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- HERO HEADER --- */}
                    <motion.header
                        className="text-center mb-16 pt-8 pb-4"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-base font-semibold text-indigo-400 tracking-wide uppercase mb-3">
                            Transparencia y Confianza
                        </h2>

                        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
                            Política de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">
                                Protección de Datos
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            En Turnes, tu privacidad es nuestra prioridad. Este documento explica cómo
                            recolectamos, usamos y protegemos tu información conforme a la Ley 1581 de 2012.
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
                            <h2 className="text-3xl font-bold text-white">Documento Oficial</h2>
                            <p className={`text-sm text-${mutedText} mt-1`}>Versión 1.1 | Publicada: 1 de octubre de 2025</p>
                        </div>

                        {/* TÍTULO I – Responsable del tratamiento (COMPLETO) */}
                        <PolicyContent id="t1" title="TÍTULO I – Responsable del Tratamiento">
                            <p>El responsable de los datos personales en Turnes es:</p>
                            <ul className="list-disc list-inside ml-6 mt-2">
                                <li>
                                    Turnes S.A.S, con NIT [PENDIENTE DE REGISTRO], domiciliada en [Dirección Física de la Empresa, Piedecuesta, Santander].
                                </li>
                            </ul>
                            <p className="mt-2">
                                Turnes decidirá sobre la base de datos y el tratamiento de la
                                información personal de todos los usuarios de la plataforma, incluyendo empleadores y empleados.
                            </p>
                        </PolicyContent>

                        {/* TÍTULO II – Objetivo (COMPLETO) */}
                        <PolicyContent id="t2" title="TÍTULO II – Objetivo">
                            <p>Esta política garantiza que Turnes trate los datos personales de sus usuarios de manera legal, segura y transparente, cumpliendo con la Ley 1581 de 2012 y normas complementarias.</p>
                            <p className="mt-2 font-semibold text-white">Los datos se utilizan para:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Facilitar la conexión entre empleadores y empleados por turnos.</li>
                                <li>Administrar la plataforma y servicios de Turnes.</li>
                                <li>Cumplir con obligaciones legales y contractuales.</li>
                            </ul>
                        </PolicyContent>

                        {/* TÍTULO III – Definiciones Clave (COMPLETO) */}
                        <PolicyContent id="t3" title="TÍTULO III – Definiciones Clave">
                            <dl className="space-y-4 mt-2">
                                <div>
                                    <dt className={`font-semibold text-white flex items-center gap-2`}>
                                        <Info size={18} className={`text-${brandPrimary}`} /> Dato Personal:
                                    </dt>
                                    <dd className="ml-6">Información que permite identificar a una persona natural.</dd>
                                </div>
                                <div>
                                    <dt className={`font-semibold text-white flex items-center gap-2 mt-2`}>
                                        <Shield size={18} className={`text-${brandPrimary}`} /> Datos Sensibles:
                                    </dt>
                                    <dd className="ml-6">
                                        Información sobre salud, biometría, orientación política o sexual, creencias religiosas, entre otros.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-white mt-2">Titular:</dt>
                                    <dd className="ml-6">Persona natural o empresa cuyos datos son tratados.</dd>
                                </div>
                                <div>
                                    <dt className={`font-semibold text-white flex items-center gap-2 mt-2`}>
                                        <Shield size={18} className={`text-${brandPrimary}`} /> Datos Financieros:
                                    </dt>
                                    <dd className="ml-6">
                                        Tarjetas de crédito/débito o información bancaria. Turnes recolecta estos datos <strong>exclusivamente</strong> para el cobro de sus propias tarifas (conexión/suscripción). Turnes <strong>NO</strong> recolecta ni procesa datos bancarios para el pago de nómina o salarios, ya que estos pagos son directos entre usuarios.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-white mt-2">Tratamiento:</dt>
                                    <dd className="ml-6">Cualquier operación sobre los datos: recolección, almacenamiento, uso, circulación o supresión.</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-white mt-2">Encargado y Responsable:</dt>
                                    <dd className="ml-6">El Encargado es quien procesa datos por cuenta de Turnes. El Responsable es Turnes, quien decide sobre el uso de los datos.</dd>
                                </div>
                            </dl>
                        </PolicyContent>

                        {/* TÍTULO IV – Principios del Tratamiento (COMPLETO) */}
                        <PolicyContent id="t4" title="TÍTULO IV – Principios del Tratamiento">
                            <p>Turnes aplicará los siguientes principios en el manejo de la información:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li><span className="font-semibold text-white">Legalidad:</span> Tratamiento conforme a la ley.</li>
                                <li><span className="font-semibold text-white">Finalidad:</span> Uso de los datos solo para los fines autorizados.</li>
                                <li><span className="font-semibold text-white">Transparencia:</span> El titular conoce cómo se usan sus datos.</li>
                                <li><span className="font-semibold text-white">Seguridad y Confidencialidad:</span> Protección frente a accesos no autorizados.</li>
                                <li><span className="font-semibold text-white">Limitación:</span> Solo se recolectan los datos necesarios para la relación laboral o de servicio.</li>
                                <li><span className="font-semibold text-white">Veracidad:</span> Los datos deben ser completos, exactos y actualizados.</li>
                            </ul>
                        </PolicyContent>

                        {/* TÍTULO V – Finalidades del Tratamiento (COMPLETO) */}
                        <PolicyContent id="t5" title="TÍTULO V – Finalidades del Tratamiento">
                            <p>Turnes utilizará los datos para:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Registro y autenticación: validar usuarios y empresas en la plataforma.</li>
                                <li><strong>Intermediación de Contacto:</strong> Compartir datos de contacto (teléfono/email) entre Empresa y Trabajador <em>únicamente</em> cuando se ha confirmado un "Match" o asignación de turno, para facilitar la coordinación y el pago directo.</li>
                                <li><strong>Cobro de Servicios de la Plataforma:</strong> Procesar pagos de suscripciones, comisiones de conexión o servicios destacados (Turnes NO procesa nómina ni pagos de salarios).</li>
                                <li>Seguridad y tecnología: protección de la información, control de accesos y soporte a sistemas.</li>
                                <li>Cumplimiento legal: obligaciones contables, fiscales y contractuales.</li>
                            </ul>
                        </PolicyContent>

                        {/* TÍTULO VI – Tratamiento de datos sensibles y de menores (COMPLETO) */}
                        <PolicyContent id="t6" title="TÍTULO VI – Datos Sensibles y de Menores">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                                <li>Los datos sensibles solo se tratarán cuando sea necesario para la relación de servicio o la seguridad de la plataforma, adoptando medidas especiales de seguridad.</li>
                                <li>Para menores de 18 años, solo se podrán recolectar datos con autorización expresa del representante legal, cumpliendo siempre con el interés superior del menor.</li>
                            </ul>
                        </PolicyContent>

                        {/* TÍTULO VII – Derechos del Titular (COMPLETO) */}
                        <PolicyContent id="t7" title="TÍTULO VII – Derechos del Titular">
                            <p>El titular de los datos tiene derecho a:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Conocer, actualizar y rectificar sus datos personales.</li>
                                <li>Solicitar prueba de la autorización otorgada.</li>
                                <li>Ser informado sobre el uso de sus datos.</li>
                                <li>Revocar la autorización o solicitar la supresión de sus datos, salvo obligación legal o contractual.</li>
                                <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
                                <li>Abstenerse de responder preguntas sobre datos sensibles.</li>
                            </ul>
                        </PolicyContent>

                        {/* TÍTULO VIII – Obligaciones de Turnes (COMPLETO) */}
                        <PolicyContent id="t8" title="TÍTULO VIII – Obligaciones de Turnes">
                            <p>Turnes se compromete a:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Garantizar el pleno ejercicio de los derechos de los titulares.</li>
                                <li>Obtener autorización previa, libre e informada antes de cualquier tratamiento.</li>
                                <li>Mantener la información segura y confidencial, con acceso restringido según roles.</li>
                                <li>Actualizar, rectificar y proteger la información de manera permanente.</li>
                                <li>Cumplir la legislación vigente y reportar violaciones de seguridad cuando sea necesario.</li>
                            </ul>
                        </PolicyContent>

                        {/* TÍTULO IX – Transferencias Internacionales (COMPLETO) */}
                        <PolicyContent id="t9" title="TÍTULO IX – Transferencias Internacionales">
                            <p>
                                Turnes podrá transferir datos a filiales, socios o proveedores (incluyendo servicios en la nube como Amazon Web Services, Google Cloud, etc.) dentro y fuera de Colombia. Se garantizará que dichos proveedores cumplan con estándares de protección de datos equivalentes o superiores a los exigidos por la ley colombiana.
                            </p>
                        </PolicyContent>

                        {/* TÍTULO X – Seguridad de los Datos (COMPLETO) */}
                        <PolicyContent id="t10" title="TÍTULO X – Seguridad de los Datos">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Uso de sistemas tecnológicos seguros y licencias originales.</li>
                                <li>Accesos restringidos mediante roles y autenticación.</li>
                                <li>Registro de todas las acciones sobre los datos para garantizar trazabilidad y auditoría.</li>
                            </ul>
                        </PolicyContent>

                        {/* TÍTULO XI – Autorización (COMPLETO) */}
                        <PolicyContent id="t11" title="TÍTULO XI – Autorización">
                            <p>
                                Turnes requiere consentimiento previo, expreso e informado del titular. Puede ser otorgado por medios digitales, escritos o verbales, y se conserva evidencia de la autorización.
                            </p>
                        </PolicyContent>

                        {/* TÍTULO XII – Consultas y Reclamos (COMPLETO) */}
                        <PolicyContent id="t12" title="TÍTULO XII – Consultas y Reclamos">
                            <>
                                <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <Clock size={18} className={`text-${brandPrimary}`} />
                                        <span>Tiempo de respuesta a consultas: **10 días hábiles**.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Info size={18} className={`text-${brandPrimary}`} />
                                        <span>Reclamos: máximo **15 días hábiles**, indicando “reclamo en trámite” en la base de datos.</span>
                                    </li>
                                </ul>

                                <p className="mt-3 font-semibold text-white">Canales de Contacto:</p>
                                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                    <li>
                                        Correo:{" "}
                                        <a
                                            href="mailto:privacidad@turnes.com"
                                            className={`text-${brandPrimary} hover:text-indigo-300`}
                                        >
                                            privacidad@turnes.com
                                        </a>
                                    </li>
                                    <li>Dirección física: [Dirección Física de la Empresa, Piedecuesta, Santander]</li>
                                </ul>
                            </>
                        </PolicyContent>

                        {/* TÍTULO XIII – Vigencia y Modificación (COMPLETO) */}
                        <PolicyContent id="t13" title="TÍTULO XIII – Vigencia y Modificación">
                            <p>
                                Los datos personales se conservarán únicamente durante el tiempo estrictamente necesario para cumplir con las finalidades para las que fueron recolectados, así como para el cumplimiento de las obligaciones legales y contractuales. La política puede modificarse avisando con antelación a su implementación.
                            </p>
                        </PolicyContent>

                        {/* TÍTULO XIV – Política de Cookies (COMPLETO) */}
                        <PolicyContent id="t14" title="TÍTULO XIV – Política de Cookies">
                            <p className="font-semibold text-white">¿Qué cookies utilizamos? Usamos cookies propias y de terceros para distintas finalidades:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Cookies Esenciales: Necesarias para el funcionamiento básico (mantener tu sesión).</li>
                                <li>Cookies de Rendimiento y Analítica: Utilizamos herramientas como Google Analytics para recopilar datos anónimos sobre visitas, páginas vistas y tiempo en el sitio.</li>
                                <li>Cookies de Funcionalidad: Recuerdan tus elecciones para una experiencia personalizada.</li>
                                <li>Cookies de Publicidad: Podemos usar cookies y píxeles (por ejemplo, de Meta o Google) para mostrar anuncios relevantes.</li>
                            </ul>
                            <p className="mt-2 text-sm text-gray-400">Puedes configurar tu navegador para rechazar todas o algunas cookies. Si desactivas las esenciales, partes de la Plataforma podrían no funcionar correctamente.</p>
                        </PolicyContent>

                        {/* TÍTULO XV – Versión Oficial (COMPLETO) */}
                        <PolicyContent id="t15" title="TÍTULO XV – Publicación y Vigencia Oficial">
                            <p className="font-semibold text-white">
                                Versión del Documento: 1.1 – Publicada el 1 de octubre de 2025.
                            </p>
                            <p className="mt-1">
                                Esta es la versión oficial y vigente de la Política de Protección de Datos Personales de Turnes.
                            </p>
                        </PolicyContent>

                        {/* AVISO LEGAL FINAL */}
                        <motion.footer
                            className="mt-12 pt-4 border-t border-red-700"
                            variants={fadeInUp}
                        >
                        </motion.footer>
                    </motion.div>

                    <CtaSection />
                </div>
            </div>
        </div>
    );
};

export default PoliticaPrivacidad;