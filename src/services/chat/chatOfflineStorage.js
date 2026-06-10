const OFFLINE_QUEUE_KEY = 'turnes_chat_offline_queue';

export const chatOfflineStorage = {
    getQueue() {
        try {
            const str = localStorage.getItem(OFFLINE_QUEUE_KEY);
            if (!str) return [];

            const parsed = JSON.parse(str);
            if (!Array.isArray(parsed)) return [];

            // 🔥 FIREWALL F12 (Anti-Envenenamiento de Caché) 🔥
            // Sanitización estricta: Filtrar basura inyectada por hackers locales en tools
            return parsed.filter(item => {
                if (!item || typeof item !== 'object') return false;
                if (!item.tempId || typeof item.tempId !== 'string') return false;
                if (!item.payload || typeof item.payload !== 'object') return false;

                const p = item.payload;
                if (!p.conversacion_id || !p.sender_id || typeof p.content !== 'string') return false;

                // Anti-Bloat Local: Destruir de la memoria si excede 5000 caracteres
                if (p.content.length > 5000) return false;

                return true;
            });
        } catch {
            // Si el JSON está masacrado/corrupto, purgamos la cola.
            localStorage.removeItem(OFFLINE_QUEUE_KEY);
            return [];
        }
    },

    save(payload) {
        const queue = this.getQueue();
        queue.push(payload);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    },

    remove(tempId) {
        let queue = this.getQueue();
        queue = queue.filter(q => q.tempId !== tempId);
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    }
};
