import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X as CloseIcon } from 'lucide-react';
import Spinner from '../../ui/Spinner';


const ProfileActionIsland = ({ isEditing, setIsEditing, loading, handleSave, handleCancel }) => {
    return (
        <>
            <style>
                {`
                    @keyframes border-glow-business {
                        0% { border-color: rgba(99, 102, 241, 0.05); box-shadow: 0 0 10px rgba(99, 102, 241, 0.02); }
                        50% { border-color: rgba(99, 102, 241, 0.2); box-shadow: 0 0 20px rgba(99, 102, 241, 0.1); }
                        100% { border-color: rgba(99, 102, 241, 0.05); box-shadow: 0 0 10px rgba(99, 102, 241, 0.02); }
                    }
                    .dynamic-island-glow-business {
                        animation: border-glow-business 8s infinite ease-in-out;
                    }
                `}
            </style>
            <div className="md:hidden fixed bottom-10 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
                <motion.div
                    layout
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className={`
                        pointer-events-auto
                        flex items-center gap-1.5 p-1.5 
                        bg-black/40 backdrop-blur-3xl 
                        rounded-[2rem] border transition-all duration-1000
                        ${isEditing ? 'border-brand-primary/20 shadow-[0_10px_30px_rgba(99,102,241,0.1)]' : 'border-white/5 shadow-[0_15px_35px_rgba(0,0,0,0.4)] dynamic-island-glow-business'}
                    `}
                >
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="editing-solid-biz"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-1 px-1 overflow-hidden"
                            >
                                <button
                                    onClick={handleCancel}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-all active:scale-90"
                                >
                                    <CloseIcon size={14} />
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="h-8 px-4 bg-brand-primary text-white border border-brand-primary/40 rounded-full font-black text-[8px] uppercase tracking-[0.25em] flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                                >
                                    {loading ? (
                                        <Spinner size={8} variant="white" />
                                    ) : (
                                        <>
                                            <Check size={12} strokeWidth={4} />
                                            <span>Actualizar</span>
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                key="idle-solid-biz"
                                onClick={() => setIsEditing(true)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 px-4 py-2 rounded-full group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_4s_infinite]" />

                                <div className="w-5 h-5 rounded-full bg-brand-primary/5 flex items-center justify-center border border-transparent transition-transform duration-700">
                                    <Edit2 size={10} className="text-white/60" />
                                </div>
                                <span className="text-white/60 font-black text-[8px] uppercase tracking-[0.3em] group-hover:text-white transition-all duration-500">
                                    Editar Info
                                </span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </>
    );
};

export default ProfileActionIsland;
