import React from 'react';
import { ChevronDown } from 'lucide-react';
import FormField from './FormField';
import QuantitySelector from './QuantitySelector';
import SmartPredictiveSearch from './SmartPredictiveSearch';
import CargoTagSelector from './CargoTagSelector';

import { MapPin, Clock, DollarSign, Calendar } from 'lucide-react';
import { TURNOS_PREDEFINIDOS } from "../../domain/vacantes.taxonomy";

const DetallesForm = ({ formData, setFormData, ui, onQuantityChange, onPaymentChange, onOpenMap }) => {
  const inputReset = "bg-transparent border-none outline-none text-base text-zinc-200 w-full placeholder:text-zinc-600 font-medium font-manrope";

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description' && value.length > 150) return;
    
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      // Si cambia la ubicación, reseteamos la confirmación quirúrgica
      if (name === 'location') {
        newState.isLocationConfirmed = false;
      }
      return newState;
    });
  };

  return (
    <section className="space-y-6 font-manrope pt-2">
      <header className="flex items-center gap-2 mb-2 text-zinc-400">
        <label className="text-sm font-semibold tracking-wide">Configuración del turno</label>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ETIQUETAS DEL CARGO: Max 2 */}
        <CargoTagSelector
          selectedTags={formData.tags || []}
          onChange={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))}
          maxTags={2}
        />

        {/* CIUDAD + CONFIRMACIÓN (Progressive Disclosure 2026) */}
        <div className="space-y-1.5">
          {/* Paso 1: Input de ciudad — full width, sin ruido */}
          <SmartPredictiveSearch
            icon={MapPin}
            placeholder="Ciudad / Municipio"
            value={formData.location}
            onChange={handleTextChange}
            mode="location"
            name="location"
          />

          {/* Paso 2: Strip contextual — solo aparece cuando hay ciudad */}
          {formData.location && (
            <button
              type="button"
              onClick={onOpenMap}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                transition-all duration-300 group text-left
                ${formData.isLocationConfirmed
                  ? 'bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-white/[0.02] border border-white/10 hover:border-white/20 shadow-sm'
                }
              `}
              aria-label="Acción">
              {/* Indicador de estado */}
              <div className={`
                shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors
                ${formData.isLocationConfirmed
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'
                }
              `}>
                <MapPin size={11} />
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                {formData.isLocationConfirmed ? (
                  <>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider leading-none">
                      Ubicación precisa ✓
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                      {formData.location}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-zinc-300 leading-none group-hover:text-white transition-colors">
                      Afinar ubicación exacta
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-400 transition-colors">
                      Opcional · Mejora el match con candidatos cercanos
                    </p>
                  </>
                )}
              </div>

              {/* Arrow / indicator derecho */}
              <div className={`
                shrink-0 text-[9px] font-black uppercase tracking-widest transition-colors
                ${formData.isLocationConfirmed ? 'text-emerald-500/40' : 'text-zinc-700 group-hover:text-zinc-400'}
              `}>
                {formData.isLocationConfirmed ? '●' : '›'}
              </div>
            </button>
          )}
        </div>




        {/* FECHA: Validación Estricta (No pasadas) */}
        <FormField icon={Calendar} className={!formData.date ? "text-zinc-600" : "text-brand-primary"}>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleTextChange}
            min={new Date().toLocaleDateString('en-CA')} // yyyy-mm-dd local (Canada locale ISO format)
            className={`bg-transparent border-none outline-none text-base w-full font-bold font-manrope [color-scheme:dark]
              ${formData.date ? 'text-white' : 'text-zinc-500 text-sm'}
            `}
            // Oculta placeholder en WebKit cuando no hay fecha
            style={{ 
              WebkitAppearance: 'none', 
              minHeight: '1.5rem',
              backgroundImage: 'none'
            }}
          />
        </FormField>

        {/* HORARIO */}
        <FormField icon={Clock}>
          <select name="schedule" className={`${inputReset} appearance-none`} onChange={handleTextChange} value={formData.schedule}>
            <option value="">Horario</option>
            {TURNOS_PREDEFINIDOS.map(t => <option key={t.id} value={t.id} className="bg-zinc-900">{t.label}</option>)}
          </select>
          <ChevronDown size={14} className="text-zinc-800 shrink-0" />
        </FormField>

        {/* CANTIDAD */}
        <QuantitySelector quantity={formData.quantity} onQuantityChange={onQuantityChange} />

        {/* PAGO */}
        <FormField icon={DollarSign}>
          <input
            type="text"
            value={formData.payment > 0 ? `$ ${ui.displayPayment}` : ""}
            placeholder="Presupuesto"
            className={`${inputReset} font-bold text-emerald-500/80`}
            onChange={onPaymentChange}
          />
        </FormField>

        {/* DESCRIPCIÓN */}
        <div className="md:col-span-2 space-y-2">
          <div className={`relative rounded-xl p-4 shadow-sm transition-all duration-300 ${ui.isDescriptionInvalid
            ? 'bg-red-500/5 border border-red-500/30'
            : 'bg-white/[0.02] border border-white/10 hover:border-white/20 focus-within:border-emerald-500/50 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            }`}>
            <textarea
              name="description"
              value={formData.description}
              rows="3"
              placeholder="Descripción de la vacante (Sin teléfonos ni direcciones)..."
              className="bg-transparent border-none outline-none text-base text-zinc-200 w-full placeholder:text-zinc-600 font-medium font-manrope resize-none min-h-[100px]"
              onChange={handleTextChange}
            />
            <div className={`absolute bottom-3 right-4 text-xs font-bold ${ui.isDescriptionInvalid ? 'text-red-500' : 'text-zinc-600'}`}>
              {ui.currentLength}/150
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetallesForm;