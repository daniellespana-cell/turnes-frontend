import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, AlertCircle } from 'lucide-react';
import Spinner from '../ui/Spinner';

import { useState, useEffect } from 'react';
import { Rocket, CheckCircle2, Zap } from 'lucide-react';
import { VacancyService } from '../../services/vacancyService';
import { useAuth } from '../../context/AuthContext';

/**
 * 🚀 BoostFlowModal
 * Interfaz premium para la compra de Impulso Urgente.
 */
const BoostFlowModal = ({ 
  isOpen, 
  onClose, 
  step, 
  onContinue, 
  onConfirm, 
  userBalance, 
  price,
  isSubmitting 
}) => {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingVacancies, setLoadingVacancies] = useState(false);

  // Cargar vacantes activas cuando llegamos al paso 'picker'
  useEffect(() => {
    if (step === 'picker' && isOpen) {
      const fetchVacancies = async () => {
        setLoadingVacancies(true);
        try {
          const { data, error } = await VacancyService.getBoostEligibleVacancies(user.id);
          
          if (error) throw error;
          setVacancies(data || []);
        } catch (err) {
          console.error("Error fetching active vacancies:", err);
        } finally {
          setLoadingVacancies(false);
        }
      };
      fetchVacancies();
    }
  }, [step, isOpen, user.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isSubmitting ? onClose : undefined}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />

      <AnimatePresence mode="wait">
        {step === 'details' ? (
          <DetailsView 
            key="details"
            onClose={onClose}
            onContinue={onContinue}
            userBalance={userBalance}
            price={price}
          />
        ) : (
          <PickerView 
            key="picker"
            onClose={onClose}
            onConfirm={onConfirm}
            vacancies={vacancies}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            isLoading={loadingVacancies}
            isSubmitting={isSubmitting}
            price={price}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: Detalles del Impulso ---
const DetailsView = ({ onClose, onContinue, userBalance, price }) => {
  const canAfford = userBalance >= price;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-6">
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
          type="button"
          aria-label="Acción">
          <X size={20} />
        </button>
      </div>
      {/* Glow Effect */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg shadow-orange-500/5">
          <Rocket className="text-orange-400" size={32} />
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Impulso Urgente</h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          Destaca tu vacante en el top de las búsquedas y notifica a los mejores talentos al instante.
        </p>

        <div className="w-full space-y-4 mb-8">
          {[
            { icon: Zap, text: 'Visibilidad prioritaria por 48H' },
            { icon: CheckCircle2, text: 'Badge de "Urgente" en el feed' },
            { icon: Rocket, text: 'Acelera la contratación x2.4' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-left p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              <item.icon size={16} className="text-orange-400 shrink-0" />
              <span className="text-xs font-medium text-zinc-300">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="w-full flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-white/5 mb-8">
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Inversión</span>
            <span className="text-xl font-black text-white">${price.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Tu Saldo</span>
            <span className={`text-sm font-bold ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
              ${userBalance.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={canAfford ? onContinue : undefined}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
            canAfford 
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
          }`}
          type="button"
          aria-label="Acción">
          {canAfford ? (
            <>
              Continuar <ChevronRight size={16} />
            </>
          ) : (
            <>
              <AlertCircle size={16} /> Saldo Insuficiente
            </>
          )}
        </button>
        
        {!canAfford && (
           <p className="mt-4 text-[10px] text-zinc-500 font-medium">
             Necesitas recargar saldo para activar este servicio.
           </p>
        )}
      </div>
    </motion.div>
  );
};

// --- SUB-COMPONENT: Selector de Vacante ---
const PickerView = ({ onClose, onConfirm, vacancies, selectedId, setSelectedId, isLoading, isSubmitting, price }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
    >
      <div className="absolute top-0 right-0 p-6">
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white transition-colors"
          disabled={isSubmitting}
          type="button"
          aria-label="Acción">
          <X size={20} />
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-black text-white uppercase tracking-wider">Elegir Vacante</h3>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          Aplica el impulso a una de tus ofertas activas
        </p>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-6">
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Spinner size="lg" variant="emerald" />
          </div>
        ) : vacancies.length === 0 ? (
          <div className="p-8 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
             <AlertCircle className="mx-auto mb-3 text-zinc-600" size={24} />
             <p className="text-xs text-zinc-400 font-medium leading-relaxed">
               No tienes vacantes activas disponibles.
             </p>
          </div>
        ) : (
          vacancies.map(v => {
            const isAlreadyBoosted = v.es_urgente && new Date(v.urgente_expiracion) > new Date();
            
            return (
              <div 
                key={v.id}
                onClick={() => !isSubmitting && !isAlreadyBoosted && setSelectedId(v.id)}
                className={`p-4 rounded-2xl border transition-all group ${
                  isAlreadyBoosted 
                    ? 'bg-white/[0.01] border-white/5 cursor-not-allowed opacity-40' 
                    : selectedId === v.id 
                      ? 'bg-orange-500/10 border-orange-500/40 cursor-pointer' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate max-w-[220px]">
                      {v.titulo}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">
                        {new Date(v.created_at).toLocaleDateString()}
                        </span>
                        {isAlreadyBoosted && (
                            <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20">
                                🔥 Activo
                            </span>
                        )}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedId === v.id ? 'border-orange-500 bg-orange-500' : 'border-zinc-700'
                  }`}>
                    {selectedId === v.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    {isAlreadyBoosted && <CheckCircle2 size={12} className="text-orange-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <button
        onClick={() => onConfirm(selectedId)}
        disabled={!selectedId || isSubmitting}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
          selectedId && !isSubmitting
            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20' 
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
        }`}
        type="button"
        aria-label="Acción">
        {isSubmitting ? (
          <>
            <Spinner size="sm" variant="white" /> Procesando Pago...
          </>
        ) : (
          `Activar Impulso ($${price.toLocaleString()})`
        )}
      </button>
    </motion.div>
  );
};

export default BoostFlowModal;
