import { useCallback, useRef } from 'react';

export const useChatSecurity = () => {
    // 🔥 Memoria de Sesión (Session Context Array) 🔥
    // Guarda el historial de mensajes de UNA conversación para atrapar números 
    // enviados dígito por dígito, SIN importar si el usuario espera 1 minuto o 5 horas (Evasión Slow-Drip).
    const recentMessages = useRef([]);

    /**
     * validateSecurity
     * Centralized DLP Engine (Area 51)
     * Detects phone numbers, external contact references, and abusive patterns.
     */
    const validateSecurity = useCallback((rawText) => {
        if (!rawText) return { valid: true };

        // 1. Limpiar buffer: Conservar solo los últimos 50 mensajes para no saturar la RAM
        if (recentMessages.current.length > 50) {
            recentMessages.current.shift(); // Elimina el más viejo
        }

        // 2. Construir Contexto Temporal (El mensaje actual + Todos los recientes unidos)
        const temporalContext = recentMessages.current.map(m => m.text).join(' ') + ' ' + rawText;

        // Función de normalización semántica (Nivel inDriver)
        const normalize = (text) => {
            // Eliminar tildes y diacríticos p. ej. 'dieciséis' -> 'dieciseis'
            let stage1 = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // Diccionario Senior de números literales
            const semanticMap = [
                // Variaciones fusionadas con "y" (e.g., treintaydos -> 30 2, treinta y dos -> 30 2)
                [/treinta\s*y\s*/g, '30 '], [/cuarenta\s*y\s*/g, '40 '], [/cincuenta\s*y\s*/g, '50 '],
                [/sesenta\s*y\s*/g, '60 '], [/setenta\s*y\s*/g, '70 '], [/ochenta\s*y\s*/g, '80 '], [/noventa\s*y\s*/g, '90 '],

                // Veintes (Fusionados por defecto en español)
                [/veintiuno/g, '21 '], [/veintidos/g, '22 '], [/veintitres/g, '23 '],
                [/veinticuatro/g, '24 '], [/veinticinco/g, '25 '], [/veintiseis/g, '26 '],
                [/veintises/g, '26 '], [/veintisiete/g, '27 '], [/veintiocho/g, '28 '], [/veintinueve/g, '29 '],
                [/\bveinte\b/g, '20 '], [/\bveinti\b/g, '20 '],

                // Adolescentes (10-19)
                [/\b(diez|dies)\b/g, '10 '], [/\bonce\b/g, '11 '], [/\bdoce\b/g, '12 '], [/\btrece\b/g, '13 '],
                [/\bcatorce\b/g, '14 '], [/\bquince\b/g, '15 '], [/dieciseis/g, '16 '], [/diecisiete/g, '17 '],
                [/dieciocho/g, '18 '], [/diecinueve/g, '19 '],

                // Decenas
                [/\btreinta\b/g, '30 '], [/\bcuarenta\b/g, '40 '], [/\bcincuenta\b/g, '50 '],
                [/\bsesenta\b/g, '60 '], [/\bsetenta\b/g, '70 '], [/\bochenta\b/g, '80 '], [/\bnoventa\b/g, '90 '],

                // Unidades (Llevan \b para no destruir palabras normales como "toDOS", "fUNcion", "esTRES")
                [/\bcero\b/g, '0 '], [/\b(uno|un)\b/g, '1 '], [/\bdos\b/g, '2 '], [/\btres\b/g, '3 '],
                [/\bcuatro\b/g, '4 '], [/\bcinco\b/g, '5 '], [/\b(seis|ses)\b/g, '6 '], [/\bsiete\b/g, '7 '],
                [/\bocho\b/g, '8 '], [/\bnueve\b/g, '9 '],

                // Centenas (Opcional pero útil para agrupaciones como "trescientos veinte")
                [/\b(cien|ciento)\b/g, '100 '], [/doscientos/g, '200 '], [/trescientos/g, '300 '],
                [/cuatrocientos/g, '400 '], [/quinientos/g, '500 '], [/seiscientos/g, '600 '],
                [/setecientos/g, '700 '], [/ochocientos/g, '800 '], [/novecientos/g, '900 ']
            ];

            semanticMap.forEach(([regex, num]) => {
                stage1 = stage1.replace(regex, num);
            });

            return {
                stage1,
                ultraClean: stage1.replace(/[^a-z0-9]/g, ""), // Elimina TODO excepto letras y números
                noSpaces: stage1.replace(/\s/g, "")
            };
        };

        const currentNorm = normalize(rawText);
        const contextNorm = normalize(temporalContext);

        // 3. BLACKLIST PATTERNS (The Wall)

        // A. Filtros de Palabras Largas (Buscamos incluso si el usuario quita los espacios)
        const blackListLongWords = [
            /whatsapp|celular|telefono|llamanos|escribeme|instagram|facebook|gmail|correo|contact|numero|nmuero|escri/i,
            /barrio|manzana|calle|carrera|diagonal|avenida|transversal|edificio|apartamento/i
        ];

        // B. Filtros de Abreviaturas Cortas (SOLO buscamos con límites de palabra \b para evitar falsos positivos)
        // Ejemplo: Evita que "una validación" ("unavalidacion") active la alerta por contener "av".
        const blackListShortAbbreviations = [
            /\b(wpp|wapp|ig|fb|av|dg|cra|cll|trv|apto|num|cel|tel|dir)\b/i
        ];

        const detectLongWords = blackListLongWords.some(pattern => pattern.test(currentNorm.ultraClean)) ||
            blackListLongWords.some(pattern => pattern.test(currentNorm.stage1));

        const detectShorts = blackListShortAbbreviations.some(pattern => pattern.test(currentNorm.stage1));

        if (detectLongWords || detectShorts) {
            return { valid: false, reason: 'DLP_POLICY_VIOLATION' };
        }

        // B. Filtros de Números Fragmentados (Revisamos TODO el contexto temporal histórico)
        const blackListPhone = [
            /3\d{9}/,      // Celulares de Colombia (10 dígitos empezando en 3)
            /[0-9]{7,}/    // Cualquier secuencia de 7 o más números combinados
        ];

        // Si la suma de los mensajes recientes resulta en 7 o más números seguidos
        const detectPhoneFragmented = blackListPhone.some(pattern => pattern.test(contextNorm.ultraClean));

        if (detectPhoneFragmented) {
            return { valid: false, reason: 'DLP_PHONE_EVASION' };
        }

        // 4. PASÓ LOS FILTROS: Lo agregamos a la memoria de sesión
        recentMessages.current.push({ text: rawText, timestamp: Date.now() });

        return { valid: true };
    }, []);

    return { validateSecurity };
};
