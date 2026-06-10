import { supabase } from './supabaseClient';

export const contactService = {
    /**
     * Envía un mensaje de contacto a la base de datos.
     * @param {Object} data - { name, email, message }
     * @returns {Object} - { success: boolean, error: object }
     */
    async sendMessage(data) {
        try {
            // Llamamos a la Edge Function que guarda en DB y despacha el correo vía Resend
            const { data: responseData, error } = await supabase.functions.invoke('send-contact-email', {
                body: data
            });

            if (error) {
                console.error("Supabase Edge Function Error:", error);
                throw error;
            }

            if (responseData?.error) {
                console.error("Resend API Error:", responseData.error);
                throw new Error(responseData.error);
            }

            return { success: true, error: null };
        } catch (error) {
            console.error("Error sending contact message:", error);
            return { success: false, error };
        }
    }
};
