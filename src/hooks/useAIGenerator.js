import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../context/ToastContext';

export const useAIGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { showToast } = useToast();

    const generateBio = useCallback(async () => {
        setIsGenerating(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-ai-bio', {
                method: 'POST',
            });

            if (error) {
                console.error("AI Generation Error:", error);
                throw new Error(error.message || 'Error al conectar con la IA');
            }

            if (data?.error) {
                throw new Error(data.error);
            }

            return data.bio;
        } catch (error) {
            console.error("Error generando biografía:", error);
            showToast("No pudimos generar la biografía con IA en este momento.", "error");
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [showToast]);

    return {
        isGenerating,
        generateBio,
    };
};
