import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check, Edit2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../styles/typography';

const ProfileHeader = ({ user, formData, handleInputChange, isEditing, setIsEditing, handleSave, loading }) => {
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
    const [isProcessing, setIsProcessing] = useState(false);

    // Sincronizar preview si cambia la data externa (Re-hidratación)
    useEffect(() => {
        if (formData.avatar) {
            setAvatarPreview(formData.avatar);
        } else if (user?.avatar) {
            setAvatarPreview(user.avatar);
        }
    }, [formData.avatar, user]);

    // --- LÓGICA DE COMPRESIÓN DE IMAGEN (TIPO FACEBOOK) ---
    // AUTO-SAVE: Guardamos la foto inmediatamente al elegirla, estilo App Nativa.
    const { actualizarPerfil } = useAuth();

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        setIsProcessing(true);

        try {
            const compressedBase64 = await compressImage(file);
            setAvatarPreview(compressedBase64);

            // 1. Actualizar form visualmente
            handleInputChange('avatar', compressedBase64);

            // 2. PERSISTENCIA INMEDIATA (Auto-Save)
            await actualizarPerfil({ avatar: compressedBase64 });

        } catch (error) {
            console.error("Error optimizando imagen:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Función de Utilidad: Compresión con Canvas
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 500; // Estándar "Red Social" para avatars
                    const MAX_HEIGHT = 500;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Exportar a WebP o JPEG de alta calidad optimizada (0.7 ~ Facebook Standard)
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // 0.8 es buen balance
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-12 w-full max-w-full"
        >
            {/* Banner de fondo abstracto (Más bajo y sutil) */}
            <div className="h-24 w-full bg-gradient-to-r from-zinc-900 via-[#0a0a0a] to-zinc-900 rounded-[1.5rem] border border-white/5 overflow-hidden relative shadow-lg z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            </div>

            {/* Info del Usuario (Layout Compacto) */}
            <div className="px-6 flex items-end gap-4 -mt-8 relative z-10 w-full max-w-full">

                {/* Avatar Compacto */}
                <div className="relative group shrink-0 z-20">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-950 border-[3px] border-[#050505] p-0.5 shadow-xl relative overflow-hidden box-content">
                        {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
                                <Loader2 className="animate-spin text-white" size={16} />
                            </div>
                        )}

                        <img
                            src={avatarPreview || user?.avatar || user?.avatarUrl}
                            alt="Profile"
                            className="w-full h-full rounded-[0.9rem] object-cover"
                        />
                    </div>

                    {/* Botón Trigger Upload */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-zinc-900 border border-zinc-700 text-white rounded-lg shadow-md hover:scale-110 transition-all z-40"
                        disabled={isProcessing}
                    >
                        <Camera size={12} />
                    </button>
                    {/* Input Oculto */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Texto y Badges */}
                <div className="flex-1 pb-1 min-w-0 w-full max-w-full z-10">
                    <h1 className={typography.entityName + " flex items-center gap-2 flex-wrap"}>
                        <span className="truncate max-w-full">{formData.name}</span>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-0.5 shrink-0" title="Cuenta Verificada">
                            <Check size={12} className="text-emerald-500" strokeWidth={2.5} />
                        </div>
                    </h1>
                    <p className={typography.body + " truncate max-w-full block"}>
                        {formData.email}
                    </p>
                </div>

                {/* Botón Editar / Guardar (Desktop Compacto) */}
                <div className="hidden md:block pb-1 shrink-0 z-10">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors text-xs font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors"
                            >
                                {loading ? '...' : 'Guardar'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all text-xs flex items-center gap-1.5"
                        >
                            <Edit2 size={12} /> Editar
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileHeader;