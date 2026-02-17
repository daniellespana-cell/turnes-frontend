import { useCallback } from 'react';

export const useChatSecurity = () => {
    /**
     * validateSecurity
     * Centralized DLP Engine (Area 51)
     * Detects phone numbers, external contact references, and abusive patterns.
     * Returns: { valid: boolean, reason: string | null }
     */
    const validateSecurity = useCallback((rawText) => {
        if (!rawText) return { valid: true };

        // 1. NORMALIZE WRITTEN NUMBERS
        let stage1 = rawText.toLowerCase();
        const numberMap = {
            'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4',
            'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9'
        };
        Object.keys(numberMap).forEach(word => {
            stage1 = stage1.replace(new RegExp(word, 'g'), numberMap[word]);
        });

        const ultraClean = stage1.replace(/[^a-z0-9]/g, "");
        const noSpaces = stage1.replace(/\s/g, "");

        // 2. BLACKLIST PATTERNS (The Wall)
        const blackList = [
            // A. Explicit Phone Patterns (3xx with 7+ digits)
            /3\d{9}/,
            /[0-9]{7,}/, // Any sequence of 7+ digits

            // B. External Channels
            /whatsapp|wpp|wapp|celular|movil|telefono|llamanos|escribeme|insta|fb|ig|gmail|correo|contact|t\.e\.l/i,

            // C. Address Patterns (Delivery/Meeting Abuse)
            /barrio|casa|manzana|calle|carrera|cll|cra|diagonal|dg|avenida|av|transversal|trv|apto|piso|edificio/i,

            // D. Evasion Attempts
            /nuemro|nmro|nmuero|escri/i
        ];

        // 3. DETECTION EXECUTION
        const detectFuga = blackList.some(pattern => pattern.test(ultraClean)) ||
            blackList.some(pattern => pattern.test(noSpaces)) ||
            blackList.some(pattern => pattern.test(stage1));

        if (detectFuga) {
            return { valid: false, reason: 'DLP_POLICY_VIOLATION' };
        }

        return { valid: true };
    }, []);

    return { validateSecurity };
};
