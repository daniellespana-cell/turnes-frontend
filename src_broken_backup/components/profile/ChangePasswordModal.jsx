import { useState } from 'react';

const ChangePasswordModal = ({ isOpen, onClose, onChangePassword, loading }) => {
    const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (passData.new !== passData.confirm) {
            setLocalError("Las contraseñas no coinciden");
            return;
        }

        const success = await onChangePassword(passData.old, passData.new);
        if (success) {
            setPassData({ old: '', new: '', confirm: '' });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-3xl  z-10"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <KeyRound size={20} className="text-purple-500" /> Cambiar Contraseña
                        </h3>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase">Contraseña Actual</label>
                            <input
                                type="password"
                                value={passData.old}
                                onChange={e => setPassData({ ...passData, old: e.target.value })}
                                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passData.new}
                                onChange={e => setPassData({ ...passData, new: e.target.value })}
                                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase">Confirmar Nueva</label>
                            <input
                                type="password"
                                value={passData.confirm}
                                onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                                className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                required
                            />
                        </div>

                        {localError && (
                            <div className="text-red-400 text-xs text-center font-bold">
                                {localError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Actualizando...' : 'Confirmar Cambio'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChangePasswordModal;
