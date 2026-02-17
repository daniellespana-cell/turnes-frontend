import React from "react";
import { motion } from "framer-motion";
import { Info, Shield, Clock, ArrowRight, CheckCircle } from "lucide-react";

// === IMPORTACIONES REALES ===
// import CtaSection from "../components/common/CtaSection.jsx"; // Eliminada la importación del CTA

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
const cardColor = 'black';         // Fondo de la tarjeta: NEGRO TOTAL
const cardTextColor = 'gray-200';  // Texto claro


// Helper Componente para el contenido de los términos (aplica animación)
const TermsContent = ({ id, title, children }) => (
    <motion.section
        id={id}
        className="mb-10 pt-4 scroll-mt-24"
        variants={fadeInUp}
    >
        {/* Títulos de sección: color de acento sobre separador oscuro */}
        <h2 className={`text-2xl font-bold border-b-2 border-gray-700 pb-2 text-${brandPrimary}`}>
            {title}
        </h2>
        <div className={`mt-4 text-${cardTextColor}`}>{children}</div>
    </motion.section>
);


// =====================================================================
// === COMPONENTE PRINCIPAL: TÉRMINOS DE SERVICIO ===
// =====================================================================

const TerminosServicio = () => {
    return (
        // Fondo general NEGRO TOTAL (bg-black)
        <div className="min-h-screen flex flex-col bg-black text-white font-sans">

            <main className="flex-grow pt-10 pb-20">
                {/* Reduced top padding from pt-24 to pt-10 to avoid excessive gap in MainLayout, 
                    but keep enough for standalone view */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- HERO HEADER --- */}
                    <motion.header
                        className="text-center mb-16 pt-8 pb-4"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-base font-semibold text-indigo-400 tracking-wide uppercase mb-3">
                            Marco Legal y Uso
                        </h2>

                        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
                            Términos de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">
                                Servicio (TOS)
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Estas son las reglas fundamentales para usar la plataforma Turnes. El uso continuado
                            implica la aceptación de estas condiciones.
                        </p>
                    </motion.header>

                    {/* DOCUMENTO LEGAL - CUERPO CENTRAL NEGRO (bg-black) */}
                    <motion.div
                        className={`max-w-4xl mx-auto bg-${cardColor} text-${cardTextColor} p-6 sm:p-10 rounded-xl shadow-2xl border border-gray-800`}
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {/* Título interno del documento */}
                        <div className="pb-4 mb-8 border-b border-gray-700">
                            <h2 className="text-3xl font-bold text-white">Documento Oficial de Términos</h2>
                            <p className="text-sm text-gray-400 mt-1">Fecha de última actualización: 1 de octubre de 2025</p>
                        </div>

                        {/* 1. Definiciones */}
                        <TermsContent id="s1" title="1. Definiciones">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li><span className="font-semibold text-white">Plataforma / Turnes:</span> Sitio web y servicios asociados para la gestión de turnos.</li>
                                <li><span className="font-semibold text-white">Trabajadores:</span> Usuarios que buscan y realizan turnos.</li>
                                <li><span className="font-semibold text-white">Empresas:</span> Usuarios que publican turnos y buscan candidatos.</li>
                                <li><span className="font-semibold text-white">Turnos:</span> Actividades de prestación de servicios independientes publicadas en la Plataforma.</li>
                            </ul>
                        </TermsContent>

                        {/* 2. Usuarios de la Plataforma */}
                        <TermsContent id="s2" title="2. Usuarios de la Plataforma">
                            <p>Al registrarte, aceptas:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Proporcionar información veraz y mantenerla actualizada.</li>
                                <li>Mantener la seguridad y confidencialidad de tu cuenta.</li>
                                <li>No usar la Plataforma con fines ilegales o fraudulentos.</li>
                                <li>Ser mayor de edad o contar con la autorización legal correspondiente.</li>
                            </ul>
                        </TermsContent>

                        {/* 3. Prestación de Servicios Independientes (Cláusula Clave) */}
                        <TermsContent id="s3" title="3. Prestación de Servicios Independientes (Cláusula Clave)">
                            <p className="mb-2">Todas las relaciones entre Trabajadores y Empresas son de **prestación de servicios independientes**. Los turnos realizados **no generan vínculo laboral**, prestaciones sociales, ni obligaciones de seguridad social a cargo de Turnes.</p>
                            <div className="mt-4 p-4 bg-indigo-900/40 rounded-lg border border-indigo-700">
                                <p className="font-semibold text-indigo-300 flex items-center gap-2">
                                    <CheckCircle size={18} /> Rol de Turnes: Intermediario de Conexión
                                </p>
                                <p className="text-sm mt-1">Turnes actúa exclusivamente como un facilitador tecnológico ("Matchmaker"). <span className="text-white font-bold">Turnes NO paga salarios ni procesa los pagos de los turnos.</span> La obligación de pago recae 100% sobre la Empresa contratante, quien debe realizar el pago directamente al Trabajador.</p>
                            </div>
                        </TermsContent>

                        {/* 4. Registro, cuentas y seguridad */}
                        <TermsContent id="s4" title="4. Registro, Cuentas y Seguridad">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Cada usuario es responsable de la confidencialidad de sus credenciales y de toda actividad en su cuenta.</li>
                                <li>Turnes puede suspender o eliminar cuentas que incumplan estos términos, sin previo aviso.</li>
                            </ul>
                        </TermsContent>

                        {/* 5. Uso Exclusivo de la Plataforma y Política Anti-Fuga (NUEVO) */}
                        <TermsContent id="s5" title="5. Uso de la Plataforma y Evasión de Tarifas">
                            <p className="font-semibold text-white">Política Anti-Evasión ("Anti-Fuga"):</p>
                            <p>El valor que Turnes aporta es la conexión inicial y la gestión de la confianza.</p>
                            <div className="mt-3 p-3 bg-red-900/40 rounded-lg border border-red-700">
                                <p className="font-semibold text-red-300">
                                    <Info size={18} className="inline-block mr-1" /> Prohibición Estricta:
                                </p>
                                <p className="text-sm mt-1">Está prohibido usar Turnes para contactar candidatos o empresas y luego coordinar el servicio "por fuera" con el fin único de **evadir el pago de la Tarifa de Conexión** o la Suscripción. El pago del turno puede ser externo (directo), pero la gestión del "Match" debe registrarse en la plataforma.</p>
                            </div>
                        </TermsContent>

                        {/* 6. Publicación y uso de turnos */}
                        <TermsContent id="s6" title="6. Publicación y Uso de Turnos">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Los turnos deben describir claramente las tareas, horarios, valor a pagar y condiciones.</li>
                                <li>No se permiten turnos ilegales, peligrosos o discriminatorios.</li>
                                <li>Turnes puede revisar o eliminar cualquier turno que incumpla la ley o estas normas.</li>
                            </ul>
                        </TermsContent>

                        {/* 7. Contenido y propiedad intelectual */}
                        <TermsContent id="s7" title="7. Contenido y Propiedad Intelectual">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Los usuarios conservan la propiedad de su contenido, pero otorgan a Turnes una licencia limitada para operar y promocionar la Plataforma.</li>
                                <li>Todos los derechos sobre la marca, logos y software de Turnes son de su propiedad exclusiva.</li>
                            </ul>
                        </TermsContent>

                        {/* 8. Responsabilidad y riesgos */}
                        <TermsContent id="s8" title="8. Limitación de Responsabilidad">
                            <p>Al ser un intermediario tecnológico que no manipula los fondos del turno:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Turnes no garantiza el pago por parte de la Empresa. El Trabajador asume el riesgo de crédito de la Empresa contratante.</li>
                                <li>Turnes no se responsabiliza por la calidad, seguridad o legalidad de los servicios prestados.</li>
                                <li>Turnes no interviene en disputas laborales, aunque puede ofrecer mediación básica basada en la evidencia digital del turno.</li>
                            </ul>
                        </TermsContent>

                        {/* 9. Pagos y tarifas */}
                        <TermsContent id="s9" title="9. Pagos y Tarifas">
                            <p>Se distinguen dos tipos de pagos:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li><span className="font-semibold text-white">Tarifas de Servicio (A Turnes):</span> Comisiones, suscripciones o destacados. Se pagan a través de la pasarela de pagos de la App.</li>
                                <li><span className="font-semibold text-white">Pago del Turno (Al Trabajador):</span> Se acuerda y ejecuta directamente entre Empresa y Trabajador (Efectivo/Transferencia). Turnes no es parte de esta transacción.</li>
                            </ul>
                        </TermsContent>

                        {/* 10. Resolución de conflictos */}
                        <TermsContent id="s10" title="10. Resolución de Conflictos">
                            <p>Trabajadores y Empresas deben intentar resolver sus diferencias directamente. Turnes podrá, a su discreción, ofrecer un servicio de mediación no vinculante a través de sus canales de soporte.</p>
                        </TermsContent>

                        {/* 11. Privacidad y protección de datos */}
                        <TermsContent id="s11" title="11. Privacidad y Protección de Datos">
                            <p>La información personal se utiliza según la Política de Privacidad, la cual forma parte integral de estos términos. (Consulta la Política de Privacidad para más detalles).</p>
                        </TermsContent>

                        {/* 12. Publicidad y comunicación */}
                        <TermsContent id="s12" title="12. Publicidad y Comunicación">
                            <p>Turnes puede enviar comunicaciones sobre servicios, ofertas o cambios. Los usuarios pueden optar por no recibir comunicaciones comerciales.</p>
                        </TermsContent>

                        {/* 13. Suspensión y terminación */}
                        <TermsContent id="s13" title="13. Suspensión y Terminación">
                            <p>Turnes puede suspender o eliminar cuentas por incumplimiento de estos términos. Los usuarios pueden eliminar su cuenta, perdiendo acceso a sus datos y reputación.</p>
                        </TermsContent>

                        {/* 14. Fuerza mayor */}
                        <TermsContent id="s14" title="14. Fuerza Mayor">
                            <p>Turnes no será responsable por fallas derivadas de causas fuera de su control.</p>
                        </TermsContent>

                        {/* 15. Modificaciones de los Términos */}
                        <TermsContent id="s15" title="15. Modificaciones de los Términos">
                            <p>Turnes puede modificar estos términos publicando la versión actualizada en la Plataforma. El uso continuado constituye la aceptación de los cambios.</p>
                        </TermsContent>

                        {/* 16. Legislación aplicable y jurisdicción */}
                        <TermsContent id="s16" title="16. Legislación Aplicable y Jurisdicción">
                            <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será sometida a los tribunales competentes de Colombia.</p>
                        </TermsContent>

                        {/* 17. Cláusula final de aceptación */}
                        <TermsContent id="s17" title="17. Cláusula Final de Aceptación">
                            <p>Al usar Turnes, **reconoces y aceptas todos los términos descritos**. Reiteras que toda relación entre Trabajador y Empresa es independiente y voluntaria, y **no genera vínculo laboral**.</p>
                        </TermsContent>

                        {/* 18. Versión y Publicación Oficial del Documento (NUEVO) */}
                        <TermsContent id="s18" title="18. Versión y Publicación Oficial">
                            <p className="font-semibold text-white">
                                Versión del Documento: 1.1 – Publicada el 1 de octubre de 2025.
                            </p>
                            <p className="mt-1">
                                Esta es la versión oficial y vigente de los Términos de Servicio de Turnes.
                            </p>
                        </TermsContent>

                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default TerminosServicio;