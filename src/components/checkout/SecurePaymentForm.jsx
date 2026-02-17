import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom'; // Importante para los links legales
import { usePaymentForm } from '../../hooks/usePaymentForm';

// Input Component mejorado: Ahora parece una "caja" oscura (Container)
const PaymentInput = ({ label, value, onChange, placeholder, icon: Icon, error, shake, maxLength, rightElement, ...props }) => (
    <motion.div
        className="space-y-1.5"
        animate={error && shake ? { x: [-3, 3, -3, 3, 0] } : {}}
        transition={{ duration: 0.3 }}
    >
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">{label}</label>
        <div className={`
            relative flex items-center transition-all duration-300 rounded-lg overflow-hidden
            ${error ? 'bg-red-900/10 border border-red-500/50' : 'bg-zinc-900/50 border border-white/5 focus-within:border-white/20 focus-within:bg-zinc-900'}
        `}>
            <input
                {...props}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                placeholder={placeholder}
                className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none font-mono tracking-wide"
            />
            {Icon && <Icon className="absolute right-3 text-zinc-500" size={16} />}
            {rightElement}
        </div>
    </motion.div>
);

const SecurePaymentForm = ({ onPaymentSuccess }) => {
    // Eliminado state 'method' ya que solo soportamos tarjeta
    const { formData, cardType, errors, isProcessing, shake, handleChange, handleSubmit } = usePaymentForm(onPaymentSuccess);

    return (
        <div className="py-2 md:pl-8">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-medium text-white">Método de Pago</h3>
                {/* CORRECCIÓN DE COLOR: Iconos de tarjetas ahora oscuros y sutiles */}
                <div className="flex gap-2">
                    <div className="h-6 w-9 bg-zinc-800 rounded border border-white/5" />
                    <div className="h-6 w-9 bg-zinc-800 rounded border border-white/5" />
                </div>
            </div>

            {/* FORM BODY - Directamente renderizamos el formulario, sin tabs */}
            <motion.form
                key="card-form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <PaymentInput
                    label="Número de Tarjeta"
                    value={formData.cardNumber}
                    onChange={(val) => handleChange('cardNumber', val)}
                    maxLength={19}
                    error={errors.cardNumber}
                    shake={shake}
                    icon={Lock}
                    rightElement={
                        cardType !== 'unknown' && (
                            <div className="absolute right-9 z-20 top-1/2 -translate-y-1/2 font-bold text-zinc-300 text-[10px] tracking-wider">
                                {cardType === 'visa' ? 'VISA' : 'MC'}
                            </div>
                        )
                    }
                />

                <PaymentInput
                    label="Nombre en Tarjeta"
                    placeholder="EJ. JUAN PEREZ"
                    value={formData.name}
                    onChange={(val) => handleChange('name', val)}
                    error={errors.name}
                    shake={shake}
                />

                <div className="grid grid-cols-2 gap-6">
                    <PaymentInput
                        label="Vencimiento"
                        placeholder="MM / AA"
                        value={formData.expiry}
                        onChange={(val) => handleChange('expiry', val)}
                        error={errors.expiry}
                        shake={shake}
                    />
                    <PaymentInput
                        label="CVC"
                        placeholder="123"
                        value={formData.cvc}
                        onChange={(val) => handleChange('cvc', val)}
                        maxLength={4}
                        type="password"
                        error={errors.cvc}
                        shake={shake}
                        icon={ShieldCheck}
                    />
                </div>

                {/* LEGAL TEXT BLOCK */}
                <div className="pt-2 px-1">
                    <p className="text-[10px] text-zinc-500 leading-relaxed text-center">
                        Al confirmar la suscripción, aceptas nuestros{' '}
                        <Link to="/legal/terms" target="_blank" className="text-zinc-300 hover:text-white underline decoration-zinc-600 underline-offset-2 transition-colors">
                            Términos y Condiciones
                        </Link>
                        {' '}y nuestra{' '}
                        <Link to="/legal/privacy" target="_blank" className="text-zinc-300 hover:text-white underline decoration-zinc-600 underline-offset-2 transition-colors">
                            Política de Privacidad
                        </Link>.
                        La renovación se procesará automáticamente.
                    </p>
                </div>

                {/* CTA - BOTÓN CON SHIMMER EFFECT */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className={`group relative overflow-hidden w-full py-4 rounded-lg font-bold text-xs uppercase tracking-[0.2em] text-white transition-all hover:opacity-90 active:scale-[0.99] shadow-[0_0_20px_rgba(16,185,129,0.15)] ${isProcessing ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500'}`}
                    >
                        <span className="relative z-10">{isProcessing ? 'Procesando...' : 'Confirmar y Suscribir'}</span>

                        {/* ESTELA BLANCA (Shimmer) */}
                        {!isProcessing && (
                            <div className="absolute top-0 left-0 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent z-0 skew-x-[-20deg]" />
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 opacity-40">
                    <Lock size={10} />
                    <span className="text-[10px] text-zinc-400">Transacción Segura 256-bit SSL</span>
                </div>
            </motion.form>
        </div>
    );
};

export default SecurePaymentForm;