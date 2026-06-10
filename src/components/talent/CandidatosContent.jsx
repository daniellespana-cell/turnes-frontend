import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CheckCircle2 } from 'lucide-react';
import CandidatoCard from './CandidatoCard';
import CandidatoRow from './CandidatoRow';

import { useEffect } from 'react';
// Iconos técnicos
import { logger } from '../../utils/logger';

const CandidatosContent = ({ activeTab, pendientes, historial, onUpdate, onSellar, onDismiss }) => {
  const isPendientes = activeTab === 'pendientes';
  const data = isPendientes ? pendientes : historial;

  // LOG DE CONTROL
  useEffect(() => {
    logger.info(`[Turnes System] Tab: ${activeTab.toUpperCase()} | Registros: ${data.length}`);
  }, [data, activeTab]);

  // --- ESTADO VACÍO (ESTILO "HIGH-END TECH") ---
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-[400px] rounded-3xl border border-transparent bg-[#09090b] relative overflow-hidden flex flex-col items-center justify-center"
      >
        {/* FONDO: Patrón de micropuntos (Dot Pattern) muy sutil */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* CONTENIDO CENTRAL */}
        <div className="relative z-10 flex flex-col items-center space-y-4">

          {/* Icono encapsulado en un "badge" */}
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm">
            {isPendientes ? (
              <CheckCircle2 strokeWidth={1.5} size={20} className="text-emerald-500/80" />
            ) : (
              <Layers strokeWidth={1.5} size={20} className="text-zinc-500" />
            )}
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-sm font-medium text-zinc-300">
              {isPendientes ? 'Bandeja Limpia' : 'Sin Historial'}
            </h3>
            <p className="text-xs text-zinc-500 font-normal">
              {isPendientes
                ? 'No hay turnos pendientes de Calificar y Sellar.'
                : 'No se encontraron registros anteriores.'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- CONTENIDO PRINCIPAL ---
  return (
    <main className="max-w-7xl mx-auto min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.99 }} // Animación muy sutil al cambiar tabs
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.2 }}
          className={isPendientes
            ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            : "flex flex-col gap-3"
          }
        >
          {data.map((can) => (
            isPendientes ? (
              <CandidatoCard
                key={can.id}
                can={can}
                onUpdate={onUpdate}
                onSellar={onSellar} // ✅ Lógica intacta
              />
            ) : (
              <CandidatoRow
                key={can.id}
                can={can}
                onDismiss={onDismiss}
              />
            )
          ))}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

export default CandidatosContent;