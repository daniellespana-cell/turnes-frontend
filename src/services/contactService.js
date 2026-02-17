import { supabase } from './supabaseClient';

export const contactService = {
    /**
     * Envía un mensaje de contacto a la base de datos.
     * @param {Object} data - { name, email, message }
     * @returns {Object} - { success: boolean, error: object }
     */
    async sendMessage(data) {
        try {
            const { error } = await supabase
                .from('contact_requests')
                .insert([
                    {
                        name: data.name,
                        email: data.email,
                        message: data.message,
                        terms_accepted: data.terms_accepted // Guardamos el consentimiento
                    }
                ]);

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error("Error sending contact message:", error);
            return { success: false, error };
        }
    }
};
