import { supabase } from '../supabaseClient';
import { authService } from '../authService';
import { chatState } from './chatState';

class ChatConversationsService {
    async loadConversations() {
        try {
            const session = await authService.getSession();
            if (!session) return;
            const userId = session.user.id;

            // 🛡️ RAZONAMIENTO MAESTRO (Basado en Esquema Real):
            // La tabla 'turnes_chats' es el índice de relaciones activas.
            // id (PK) -> postulaciones(id)
            // empresa_id -> perfiles(id)
            // postulante_id -> perfiles(id)
            
            const { data, error } = await supabase
                .from('turnes_chats')
                .select(`
                    id,
                    empresa_id,
                    postulante_id,
                    postulacion:postulaciones!turnes_chats_id_fkey (
                        id, updated_at, status, step, protocol_state, user_id,
                        vacante:vacantes (
                            id, titulo, empresa_id,
                            empresa:empresas (nombre_comercial, logo_url)
                        ),
                        postulante:perfiles (nombre_display, avatar_url)
                    )
                `)
                .or(`empresa_id.eq.${userId},postulante_id.eq.${userId}`)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('🔥 [ChatConversations] Error en turnes_chats:', error);
                chatState.updateSnapshot({ loading: false });
                return;
            }

            if (!data || data.length === 0) {
                chatState.updateSnapshot({ conversations: {}, loading: false });
                return;
            }

            const convMap = {};
            data.forEach(item => {
                const c = item.postulacion;
                if (!c) return;

                const vacante = c.vacante || {};
                const empresa = vacante.empresa || {};
                const postulante = c.postulante || {};

                const empresaId = item.empresa_id || vacante.empresa_id;
                const postulanteId = item.postulante_id || c.user_id;
                const otherUserId = empresaId === userId ? postulanteId : empresaId;

                convMap[c.id] = {
                    id: c.id,
                    empresa_id: empresaId,
                    postulante_id: postulanteId,
                    otherUserId: otherUserId,
                    candidateId: postulanteId,
                    companyId: empresaId,
                    updated_at: c.updated_at,
                    status: c.status,
                    step: c.step,
                    protocol_state: c.protocol_state,
                    // Datos unificados para la UI
                    empresa: {
                        id: empresaId,
                        nombre_comercial: empresa.nombre_comercial || 'Empresa Turnes',
                        logo_url: empresa.logo_url || null
                    },
                    postulante: {
                        id: postulanteId,
                        nombre_display: postulante.nombre_display || 'Usuario Turnes',
                        avatar_url: postulante.avatar_url || null
                    },
                    vacante: {
                        id: vacante.id,
                        titulo: vacante.titulo || 'Vacante'
                    }
                };
            });

            chatState.updateSnapshot({ conversations: convMap, loading: false });
        } catch (e) {
            console.error('🔥 [ChatConversations] Error crítico de esquema:', e);
            chatState.updateSnapshot({ loading: false });
        }
    }

    /**
     * Acciones de Menú (Archivar, Bloquear, Eliminar)
     * Utiliza un RPC K.I.S.S. en PostgreSQL para aislamiento de estados por usuario.
     */
    async manageChatVisibility(chatId, action) {
        try {
            const { data, error } = await supabase.rpc('rpc_manage_chat_visibility', {
                p_chat_id: chatId,
                p_action: action
            });
            if (error) throw error;
            return data;
        } catch (e) {
            console.error("Error managing chat visibility:", e);
            throw e;
        }
    }
}

export const chatConversations = new ChatConversationsService();
