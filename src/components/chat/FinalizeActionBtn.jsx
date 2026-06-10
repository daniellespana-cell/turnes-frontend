import React from 'react';
import { Send } from 'lucide-react';
import Spinner from '../ui/Spinner';


/**
 * FinalizeActionBtn (K.I.S.S Component)
 * Centralizes the UI for the Step 4 action ("Finalizar y Calificar").
 * Used across the system: Chat Bubbles, Sidebar (Desktop), and Mobile Dashboard.
 */
export const FinalizeActionBtn = ({
    onFinalize,
    isFinalizing,
    className = "",
    iconSize = 12
}) => {
    return (
        <button
            onClick={onFinalize}
            disabled={isFinalizing || !onFinalize}
            className={`
                flex items-center justify-center gap-2 transition-all active:scale-[0.98] 
                bg-gradient-to-r from-emerald-500 to-purple-600 text-white 
                border-transparent hover:brightness-110 shadow-lg shadow-purple-900/20 
                font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {isFinalizing ? (
                <><Spinner size="sm" variant="white" /> Sellando...</>
            ) : (
                <><Send size={iconSize} /> Finalizar y Calificar</>
            )}
        </button>
    );
};

export default FinalizeActionBtn;
