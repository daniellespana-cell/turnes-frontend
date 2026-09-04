import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useState } from 'react';

const faqData = [
  {
    question: "¿Cómo garantiza Turnes la calidad de los trabajadores?",
    answer: "Utilizamos un sistema de verificación de 3 niveles: Identidad (ID gubernamental), Antecedentes Penales y Referencias Laborales validadas. Además, cada trabajador tiene un 'Score de Confiabilidad' basado en su desempeño real en la plataforma."
  },
  {
    question: "¿Cuánto tiempo tarda en cubrirse una vacante?",
    answer: "Nuestro promedio actual es de 2 horas para turnos inmediatos y 24 horas para posiciones fijas. El algoritmo de matching notifica instantáneamente a los candidatos más aptos y cercanos."
  },
  {
    question: "¿Cómo funcionan los pagos y comisiones?",
    answer: "Para empresas, el registro es gratuito y solo pagan una tarifa de conexión tecnológica por turno confirmado (del 0% al 6% según su plan). Para trabajadores, Turnes es 100% gratuito (0% de comisión): la empresa te paga el 100% del valor del turno directamente al finalizar (en efectivo, Nequi, DaviPlata o transferencia). Turnes jamás retiene ni descuenta salarios."
  },
  {
    question: "¿Puedo contratar personal fijo o solo por turnos?",
    answer: "Ambos. Turnes nació para la flexibilidad (turnos extra), pero muchas empresas utilizan nuestra plataforma para probar talento antes de ofrecer contratos de planta permanente."
  },
  {
    question: "¿Qué pasa si un trabajador no se presenta?",
    answer: "Contamos con una política de 'No-Show' estricta. Si un trabajador falla sin aviso, el sistema activa automáticamente a un 'Reemplazo Garantizado' de nuestra reserva prioritaria para minimizar el impacto en tu operación."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-12 bg-zinc-950 border-t border-zinc-900">
      <div className="container mx-auto px-6 max-w-2xl">

        {/* Minimal Header */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 block">
            Ayuda Rápida
          </span>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Preguntas Frecuentes
          </h2>
        </div>

        {/* Ultra-Compact Accordion */}
        <div className="space-y-0 divide-y divide-zinc-900 border-t border-b border-zinc-900">
          {faqData.map((item, index) => (
            <div key={index} className="group">
              <button
                onClick={() => setOpenIndex(prev => prev === index ? null : index)}
                className="w-full flex items-center justify-between py-3 text-left focus:outline-none hover:bg-zinc-900/30 transition-colors px-2 rounded-lg"
                type="button"
                aria-label="Acción">
                <span className={`text-sm font-medium transition-colors ${openIndex === index ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                  {item.question}
                </span>
                <span className={`ml-4 text-xs font-mono transition-transform duration-200 ${openIndex === index ? 'rotate-180 text-emerald-500' : 'text-zinc-700'}`}>
                  ▼
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{
                      opacity: 0
                    }}
                    animate={{
                      opacity: 1
                    }}
                    exit={{
                      opacity: 0
                    }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-zinc-300 pb-3 px-2 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Micro CTA */}
        <div className="mt-8 text-center">
          <Link to="/contacto" className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-wider font-bold">
            ¿Más dudas? <span className="underline decoration-zinc-800 hover:decoration-emerald-500 ml-1">Ir a Soporte</span>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
