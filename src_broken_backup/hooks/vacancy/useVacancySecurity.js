import { useMemo } from 'react';

/**
 * useVacancySecurity (Micro-Hook K.I.S.S)
 * Responsabilidad Única: Prevenir Fuga de Datos (DLP) en la descripción de las vacantes.
 */
export const useVacancySecurity = (description) => {
    const hasSensitiveData = useMemo(() => {
        if (!description) return false;

        const sensitivePatterns = [
            /\d{7,}/g, // Teléfonos largos o IDs
            /calle|carrera|cll|cra|avenida|av\.|transversal|diagonal/gi, // Direcciones
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Correos Electrónicos
            /3\d{9}/g, // Celulares en Colombia (3XX XXX XXXX)
            /(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|cero|celular|teléfono|contacto|llamar|escríbeme|wpp|whatsapp)/gi
        ];

        return sensitivePatterns.some(pattern => {
            const match = description.match(pattern);
            // Si son números escritos en letras, exige al menos 3 coincidencias para no dar falsos positivos.
            if (pattern.source.includes('uno|dos')) {
                return match && match.length >= 3;
            }
            return match;
        });
    }, [description]);

    return { hasSensitiveData };
};
