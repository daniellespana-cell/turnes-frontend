import React from 'react';
import { m as motion } from 'framer-motion';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Spinner from '../ui/Spinner';


const ContactForm = ({ formData, status, handleChange, handleSubmit, resetForm }) => {

    // Vista de Éxito
    if (status === 'success') {
        return (
            <div className="lg:col-span-2 p-8 bg-white/5 backdrop-blur-md border border-transparent rounded-2xl  relative overflow-hidden h-full flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-8 ring-1 ring-white/10">
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 tracking-tight">¡Mensaje Recibido!</h3>
                    <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
                        Nuestro equipo ya tiene tu solicitud en radar. Te responderemos en breve (menos de 24h).
                    </p>
                    <button
                        onClick={resetForm}
                        className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 border border-transparent  rounded-lg text-white text-sm font-medium transition-all duration-300"
                        type="button"
                        aria-label="Acción">
                        Enviar otro mensaje
                    </button>
                </motion.div>
            </div>
        );
    }

    // Vista del Formulario
    return (
        <div className="lg:col-span-2 p-8 md:p-10 bg-white/5 backdrop-blur-md border border-transparent rounded-2xl  relative overflow-hidden">
            <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Envíanos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">Nombre Completo</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={status === 'loading'}
                            className="w-full px-4 py-3 bg-black/40 border border-transparent rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={status === 'loading'}
                            className="w-full px-4 py-3 bg-black/40 border border-transparent rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
                            placeholder="tu.correo@empresa.com"
                        />
                    </div>
                </div>

                {/* Mensaje */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-2">Mensaje</label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={status === 'loading'}
                        className="w-full px-4 py-3 bg-black/40 border border-transparent rounded-xl text-white placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 resize-none"
                        placeholder="Describe tu consulta o necesidad de soporte..."
                    ></textarea>
                </div>

                {/* --- Security & Legal --- */}

                {/* Honeypot (Anti-Spam) - Hidden from users */}
                <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot || ''}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                />

                {/* Privacy Checkbox */}
                <div className="flex bg-white/5 rounded-xl border border-transparent p-4 md:p-5 transition-colors hover:bg-white/10 ">
                    <div className="flex h-6 items-center">
                        <input
                            id="acceptedTerms"
                            name="acceptedTerms"
                            type="checkbox"
                            checked={formData.acceptedTerms || false}
                            onChange={handleChange}
                            required
                            disabled={status === 'loading'}
                            className="h-5 w-5 rounded border-zinc-600 bg-zinc-900/50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900 cursor-pointer transition-all"
                        />
                    </div>
                    <div className="ml-4 flex flex-col justify-center text-sm leading-relaxed">
                        <label htmlFor="acceptedTerms" className="font-medium text-zinc-300 cursor-pointer select-none">
                            Acepto la <a href="/privacidad" className="text-emerald-400 hover:text-emerald-300 font-semibold underline decoration-emerald-500/30 hover:decoration-emerald-400 transition-colors">Política de Privacidad</a> y el tratamiento de mis datos personales.
                        </label>
                    </div>
                </div>

                {/* Mensaje de Error */}
                {status === 'error' && (
                    <div className="flex items-center gap-3 text-red-300 bg-red-900/20 border border-red-500/20 p-4 rounded-xl">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">Hubo un error al enviar el mensaje. Intenta nuevamente.</span>
                    </div>
                )}

                {/* Botón de Envío */}
                <div>
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="group w-full flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Acción">
                        {status === 'loading' ? (
                            <>
                                <Spinner size="sm" variant="white" />
                                <span className="tracking-wide">ENVIANDO...</span>
                            </>
                        ) : (
                            <>
                                <span className="tracking-wide">ENVIAR MENSAJE</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-zinc-500 mt-4">
                        Protegido por reCAPTCHA Enterprise.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
