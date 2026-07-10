import React from 'react';
import { Zap } from 'lucide-react';

import { useMemo } from 'react';

/**
 * 🌠 CHAT SUGGESTIONS COMPONENT (Context-Aware)
 * Extrae la lógica de sugerencias rápidas para mantener ChatInput limpio (Anti-Spaghetti).
 * Evalúa dinámicamente la etapa del protocolo para ofrecer frases Relevantes.
 */
export const ChatSuggestions = ({ onSend, isContracted, isRehire, userRole }) => {
    const suggestions = useMemo(() => {
        // 🟢 FASE OPERATIVA: Ya se firmó el contrato (Steps 3 y 4)
        if (isContracted) {
            return userRole === 'trabajador'
                ? ["Confirma asistencia puntual", "¿Cuál es el código de vestimenta?", "Allí estaré puntual"]
                : ["Te pago en efectivo al finalizar", "Recuerda traer tu documento", "¿Sabes cómo llegar?"];
        }

        // ⚡ FAST-TRACK UX: Negociación de Recontratación Directa
        if (isRehire) {
            return userRole === 'trabajador'
                ? ["¡Gracias por tenerme en cuenta!", "Aceptaré la oferta en un momento", "¿Mismas condiciones que la última vez?"]
                : ["Me gustó tu trabajo anterior", "¿Puedes cubrir este turno también?", "Te envié una oferta directa"];
        }

        // 🌐 PUBLIC FEED UX: Negociación Standard (Antes de contratar - Steps 1 y 2)
        // 🚨 REGRA DE NEGOCIO CRÍTICA: Priorizar "Validación Visual" para la empresa antes de contratar.
        return userRole === 'trabajador'
            ? ["¡Hola! Estoy muy interesado en el turno", "¿Tienen flexibilidad de horario?", "Tengo experiencia en esto"]
            : ["Hagamos una validación visual rápida", "He visto tu perfil y me ha interesado", "¿Estás disponible hoy?"];
    }, [isContracted, isRehire, userRole]);

    if (!suggestions || suggestions.length === 0) return null;

    return (
        <>
            {suggestions.map((s, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onSend(s)}
                    className="shrink-0 flex items-center gap-2 px-3.5 py-2 bg-zinc-900/60 border border-transparent rounded-full  hover:bg-emerald-500/10 transition-all duration-300 group shadow-md"
                    aria-label="Acción">
                    <Zap size={10} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" fill="currentColor" />
                    <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 tracking-wide">
                        {s}
                    </span>
                </button>
            ))}
        </>
    );
};

export default ChatSuggestions;
