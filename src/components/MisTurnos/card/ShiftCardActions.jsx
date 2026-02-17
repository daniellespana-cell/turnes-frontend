import React from 'react';
import { Map, MessageCircle, Trash2 } from 'lucide-react';

export const ShiftCardActions = ({ shift, onDelete, onChat }) => {

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que deseas eliminar este turno del historial?')) {
            onDelete(shift.id);
        }
    };

    const handleRoute = (e) => {
        e.stopPropagation();
        // Here we could implement a real map open logic
        console.log('Opening map for:', shift.address);
    };

    const handleChat = (e) => {
        e.stopPropagation();
        if (onChat) onChat();
    };

    return (
        <div className="pt-2 flex gap-3">
            {/* Primary Action: Delete (if history) OR Route */}
            {onDelete ? (
                <button
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                    <Trash2 size={14} />
                    Borrar
                </button>
            ) : (
                <button
                    onClick={handleRoute}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-800 border border-white/5 text-xs font-medium text-white hover:bg-zinc-700 active:scale-95 transition-all"
                >
                    <Map size={14} className="text-zinc-400" />
                    Ruta
                </button>
            )}

            {/* Secondary Action: Chat (Only if confirmed) */}
            {shift.status === 'confirmed' && (
                <button
                    onClick={handleChat}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
                >
                    <MessageCircle size={14} />
                    Chat
                </button>
            )}
        </div>
    );
};
