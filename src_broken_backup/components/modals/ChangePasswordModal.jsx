import { useState } from 'react';

/**
 * ChangePasswordModal — Componente compartido (DRY)
 * Usado tanto en WorkerProfile como en el perfil de empresa.
 * @param {{ isOpen: boolean, onClose: () => void, onSubmit: (old, new) => Promise<boolean>, isLoading: boolean }} props
 */
const ChangePasswordModal = ({ isOpen, onClose, onSubmit, isLoading = false }) => {
    const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
    const [passError, setPassError] = useState('');

    const handleClose = () => {
        setPassData({ old: '', new: '', confirm: '' });
        setPassError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPassError('');

        if (passData.new.length < 6) {
            setPassError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (passData.new !== passData.confirm) {
            setPassError('Las contraseñas no coinciden.');
            return;
        }

        const success = await onSubmit(passData.old, passData.new);
        if (success) {
            handleClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-3xl z-10"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <KeyRound size={20} className="text-purple-500" /> Cambiar Contraseña
                            </h3>
                            <button
                                onClick={handleClose}
                                className="text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {[
                                { label: 'Contraseña Actual', key: 'old' },
                                { label: 'Nueva Contraseña', key: 'new' },
                                { label: 'Confirmar Nueva', key: 'confirm' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="text-xs font-bold text-zinc-500 uppercase">{label}</label>
                                    <input
                                        type="password"
                                        value={passData[key]}
                                        onChange={e => setPassData(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                        required
                                        minLength={key !== 'old' ? 6 : undefined}
                                    />
                                </div>
                            ))}

                            {passError && (
                                <p className="text-xs text-red-400 font-medium">{passError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Actualizando...' : 'Confirmar Cambio'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
