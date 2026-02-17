import React from "react";
import { motion } from "framer-motion";
// 🛠️ CORRECCIÓN: Se agrega Clock a la lista de importaciones de lucide-react.
import { DollarSign, Percent, Shield, Zap, RefreshCw, Clock } from "lucide-react";

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

const brandPrimary = 'amber-400'; // Color de acento: Ámbar (Amarillo)
const cardColor = 'black';         // Fondo de la tarjeta: NEGRO TOTAL
const cardTextColor = 'gray-200';  // Texto claro


// Helper Componente para el contenido de la política (aplica animación)
const PolicyContent = ({ id, title, children }) => (
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
// === COMPONENTE PRINCIPAL: POLÍTICA DE PAGOS ===
// =====================================================================

const PoliticaPagos = () => {
    return (
        // Fondo general NEGRO TOTAL (bg-black)
        <div className="min-h-screen flex flex-col bg-black text-white font-sans">

            <main className="flex-grow pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- HERO HEADER --- */}
                    <motion.header
                        className="text-center mb-16 pt-8 pb-4"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <h2 className="text-base font-semibold text-amber-400 tracking-wide uppercase mb-3">
                            Transparencia Financiera
                        </h2>

                        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white">
                            Política de <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                                Pagos y Tarifas
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Reglas claras sobre cómo se procesan, distribuyen y se aplican las tarifas
                            por los servicios de Turnes.
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
                            <h2 className="text-3xl font-bold text-white">Modelo de Tarifas de Turnes</h2>
                            <p className="text-sm text-gray-400 mt-1">Versión 1.0 | Publicada: 1 de octubre de 2025</p>
                        </div>

                        {/* 1. Moneda y Procesamiento */}
                        <PolicyContent id="p1" title="1. Moneda y Procesamiento de Pagos">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li><span className="font-semibold text-white">Moneda Oficial:</span> Todas las tarifas se expresan en **Pesos Colombianos (COP)**.</li>
                                <li><span className="font-semibold text-white">Rol de la Plataforma:</span> Turnes actúa exclusivamente como un <span className="text-amber-400">intermediario de conexión</span>. Procesamos únicamente el cobro de la **Comisión de Servicio** o **Suscripción** a la Empresa.</li>
                                <li><span className="font-semibold text-white">Pago del Turno:</span> El pago por los servicios del Trabajador (el valor del turno) se realiza <span className="text-white font-bold">directamente entre la Empresa y el Trabajador</span>. Turnes no recibe, retiene ni dispersa salarios.</li>
                            </ul>
                        </PolicyContent>

                        {/* 2. Estructura de Comisiones por Turnos */}
                        <PolicyContent id="p2" title="2. Tarifa de Conexión (Comisión del Servicio)">
                            <p>Turnes cobra a la Empresa una tarifa por el servicio de conexión y gestión tecnológica ("Match") por cada turno confirmado. Esta tarifa es independiente del pago al trabajador.</p>

                            <div className="mt-4 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                                <p className="font-semibold text-amber-300 flex items-center gap-2 mb-2">
                                    <Percent size={18} /> Tarifas de Conexión (Pagadas por la Empresa a Turnes):
                                </p>
                                <ul className="list-disc list-inside ml-6 space-y-2">
                                    <li><span className="font-semibold text-white">Plan Básico (Gratuito):</span> Tarifa del **6%** sobre el valor nominal del turno.</li>
                                    <li><span className="font-semibold text-white">Plan Micro ($29,900/mes):</span> Tarifa reducida del **4%** sobre el valor nominal del turno.</li>
                                    <li><span className="font-semibold text-white">Plan Pro (Ilimitado):</span> **0% de comisión.** Exoneración total de tarifas de conexión.</li>
                                </ul>
                            </div>
                        </PolicyContent>

                        {/* 3. Tarifas Fijas y Microservicios */}
                        <PolicyContent id="p3" title="3. Servicios Adicionales">
                            <p>Servicios de visibilidad o verificación opcionales:</p>
                            <ul className="list-disc list-inside ml-6 mt-3 space-y-2">
                                <li><span className="font-semibold text-white">Contratación Fija:</span> <span className="text-amber-400">$19,900 COP</span> pago único por publicar una vacante permanente (15 días de visibilidad).</li>
                                <li><span className="font-semibold text-white">Destacar Turno ("Urgente"):</span> <span className="text-amber-400">$7,000 COP</span> para posicionar la oferta en el top de búsquedas.</li>
                                <li><span className="font-semibold text-white">Suscripciones:</span> Pagos recurrentes mensuales para acceder a beneficios de los planes Micro y Pro.</li>
                            </ul>
                        </PolicyContent>

                        {/* 4. Pago al Trabajador (Método Directo) */}
                        <PolicyContent id="p4" title="4. Pago al Trabajador (Modelo Directo)">
                            <p className="mb-2">Turnes <strong>NO</strong> interfiere en el flujo monetario del turno. El pago se realiza de la siguiente manera:</p>
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li><span className="font-semibold text-white">Acuerdo Directo:</span> La Empresa paga directamente al Trabajador el 100% del valor acordado.</li>
                                <li><span className="font-semibold text-white">Medios de Pago:</span> Puede ser en **Efectivo**, transferencia bancaria, o billeteras digitales (Nequi, DaviPlata), según lo acuerden las partes al finalizar el turno.</li>
                                <li><span className="font-semibold text-white">Momento del Pago:</span> Salvo acuerdo previo diferente, el pago debe realizarse al finalizar el turno ("Día trabajado, día pagado").</li>
                            </ul>
                            <div className="mt-4 p-3 bg-indigo-900/40 rounded-lg border border-indigo-700">
                                <p className="font-semibold text-indigo-300 flex items-center gap-2">
                                    <Shield size={18} /> Garantía de Cumplimiento:
                                </p>
                                <p className="text-sm mt-1">
                                    Aunque el pago es directo, Turnes monitorea el cumplimiento. Si una Empresa no paga lo acordado, será sancionada y expulsada de la plataforma. Los Trabajadores pueden reportar impagos a través del sistema de soporte.
                                </p>
                            </div>
                        </PolicyContent>

                        {/* 5. Reembolsos y Disputas */}
                        <PolicyContent id="p5" title="5. Política de Reembolsos">
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                                <li><span className="font-semibold text-white">Tarifas de Conexión:</span> Si un turno se cancela por causa imputable al Trabajador (no show), Turnes reembolsará a la Empresa la tarifa de conexión (comisión) pagada, en forma de crédito para futuros turnos.</li>
                                <li><span className="font-semibold text-white">Suscripciones:</span> No hay reembolsos parciales por cancelaciones de suscripciones mensuales.</li>
                            </ul>
                        </PolicyContent>

                        {/* 6. Prohibición de Evasión (Anti-Fuga) */}
                        <PolicyContent id="p6" title="6. Prohibición de Evasión de Comisión (Anti-Fuga)">
                            <div className="mt-3 p-4 bg-red-900/40 rounded-lg border border-red-700">
                                <p className="font-semibold text-red-300 flex items-center gap-2">
                                    <Zap size={18} className="flex-shrink-0" /> USO OBLIGATORIO PARA LA CONEXIÓN:
                                </p>
                                <p className="text-sm mt-1">
                                    Está estrictamente prohibido usar Turnes para contactar trabajadores y luego coordinar el turno "por fuera" para evadir el pago de la **Tarifa de Conexión** o la Suscripción.
                                </p>
                                <p className="text-sm mt-2 font-medium">
                                    Detectamos patrones de contacto inusuales. La violación de esta política resultará en el bloqueo permanente de la Empresa.
                                </p>
                            </div>
                        </PolicyContent>

                        {/* 7. Impuestos y Retenciones */}
                        <PolicyContent id="p7" title="7. Impuestos y Retenciones">
                            <p>Cada usuario (Trabajador y Empresa) es el único responsable de declarar y pagar los impuestos que le correspondan según las leyes colombianas (incluyendo IVA, retenciones, o cualquier otro tributo) derivados de los servicios prestados o contratados.</p>
                        </PolicyContent>

                        {/* 8. Modificaciones */}
                        <PolicyContent id="p8" title="8. Modificaciones de la Política de Pagos">
                            <p>Turnes puede modificar esta Política en cualquier momento, publicando la nueva versión. Las tarifas y comisiones vigentes para un turno o suscripción se aplicarán al momento de la contratación o renovación.</p>
                        </PolicyContent>

                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PoliticaPagos;