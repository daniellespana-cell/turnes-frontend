import React from 'react';
import { MapPin, Clock, DollarSign, Calendar, Search, ChevronDown } from 'lucide-react';
import FormField from './FormField';
import QuantitySelector from './QuantitySelector';
import { TURNOS_PREDEFINIDOS } from "../../domain/vacantes.taxonomy";
import SmartPredictiveSearch from './SmartPredictiveSearch';

const DetallesForm = ({ formData, setFormData, ui, onQuantityChange, onPaymentChange }) => {
  const inputReset = "bg-transparent border-none outline-none text-[13px] text-zinc-200 w-full placeholder:text-zinc-700 font-medium font-manrope";

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description' && value.length > 150) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="bg-zinc-900/20 border border-white/[0.03] rounded-[2rem] p-6 md:p-8 space-y-5 font-manrope backdrop-blur-md">
      <header className="flex items-center gap-2 mb-2 opacity-40 text-zinc-400">
        <label className="text-[9px] font-black uppercase tracking-[0.2em]">Configuración del Turno</label>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARGO: Predictivo Inteligente */}
        <SmartPredictiveSearch
          icon={Search}
          placeholder="Cargo / Puesto"
          value={formData.title}
          onChange={handleTextChange}
          mode="cargo"
          name="title" // Needed for standard event handling if my component mimics it
        />

        {/* CIUDAD: Predictivo Inteligente */}
        <SmartPredictiveSearch
          icon={MapPin}
          placeholder="Ciudad / Municipio"
          value={formData.location}
          onChange={handleTextChange}
          mode="location"
          name="location"
        />

        {/* DIRECCIÓN EXACTA (Geocoding) */}
        <div className="relative group">
          <div className={`flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 focus-within:border-emerald-500/50 focus-within:bg-zinc-900 transition-all ${!formData.location ? 'opacity-50 pointer-events-none' : ''}`}>
            <MapPin size={18} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              name="address"
              placeholder="Dirección exacta (Ej: Calle 100 #15-20)"
              value={formData.address || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              onBlur={async (e) => {
                const addr = e.target.value;
                if (addr.length > 5 && formData.location) {
                  try {
                    const query = `${addr}, ${formData.location}, Colombia`;
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    if (data && data[0]) {
                      setFormData(prev => ({
                        ...prev,
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                      }));
                      console.log("📍 Geocoded:", data[0].lat, data[0].lon);
                    }
                  } catch (err) {
                    console.error("Geocoding failed", err);
                  }
                }
              }}
              className={inputReset}
            />
          </div>
          {!formData.location && <span className="absolute -bottom-4 left-2 text-[9px] text-zinc-600 font-medium">Selecciona ciudad primero</span>}
        </div>

        {/* FECHA: Validación Estricta (No pasadas) */}
        <SmartPredictiveSearch
          icon={Calendar}
          placeholder="Fecha del Turno"
          value={formData.date}
          onChange={handleTextChange}
          type="date"
          name="date"
        />

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
          <div className={`relative rounded-xl p-4 transition-all duration-500 ${ui.isDescriptionInvalid
            ? 'bg-red-500/5 border border-red-500/30 ring-1 ring-red-500/10'
            : 'bg-zinc-900/30 border border-white/5 focus-within:bg-zinc-900/50 focus-within:border-purple-500/20 focus-within:shadow-[0_0_15px_-5px_rgba(168,85,247,0.1)]'
            }`}>
            <textarea
              name="description"
              value={formData.description}
              rows="3"
              placeholder="Descripción de la vacante (Sin teléfonos ni direcciones)..."
              className="bg-transparent border-none outline-none text-[13px] text-zinc-200 w-full placeholder:text-zinc-700 font-medium font-manrope resize-none min-h-[80px]"
              onChange={handleTextChange}
            />
            <div className={`absolute bottom-3 right-4 text-[8px] font-black tracking-widest ${ui.isDescriptionInvalid ? 'text-red-500' : 'text-zinc-800'}`}>
              {ui.currentLength}/150
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetallesForm;