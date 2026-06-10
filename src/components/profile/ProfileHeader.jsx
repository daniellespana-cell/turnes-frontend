import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Check, Edit2 } from 'lucide-react';
import Spinner from '../ui/Spinner';

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { typography } from '../../styles/typography';
import { compressImageToBlob } from '../../utils/imageUtils';
import { storageService } from '../../services/storageService';
import { AssetResolver } from '../../utils/assetHelper';

const ProfileHeader = ({ user, formData, handleInputChange, isEditing, setIsEditing, handleSave, loading }) => {
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url);
    const [isProcessing, setIsProcessing] = useState(false);

    // Sincronizar preview si cambia la data externa (Re-hidratación)
    useEffect(() => {
        if (formData.avatar) {
            setAvatarPreview(formData.avatar);
        } else if (user?.avatar_url) {
            setAvatarPreview(user.avatar_url);
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
            return; // El input ya filtra por accept="image/*"
        }

        setIsProcessing(true);

        try {
            // 1. Single Source of Truth para compresión a Blob
            const compressedBlob = await compressImageToBlob(file);
            
            // Preview visual instantáneo (Memoria local)
            const objectUrl = URL.createObjectURL(compressedBlob);
            setAvatarPreview(objectUrl);
            handleInputChange('avatar', objectUrl);

            // 2. Subida a Supabase Storage (Bucket 'avatars')
            const storagePath = await storageService.uploadAvatar(compressedBlob, user.id);

            // 3. Guardar solo la ruta en la Base de Datos Postgres
            await actualizarPerfil({ avatar: storagePath });

        } catch (error) {
            console.error("Error optimizando imagen:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // La función compressImage local fue eliminada (Se usa imageUtils.js como SSOT)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-12 w-full max-w-full"
        >
            {/* Banner de fondo abstracto (Más bajo y sutil) */}
            <div className="h-24 w-full bg-gradient-to-r from-zinc-900 via-[#0a0a0a] to-zinc-900 rounded-[1.5rem] border border-transparent overflow-hidden relative shadow-lg z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            </div>

            {/* Info del Usuario (Layout Compacto) */}
            <div className="px-6 flex items-end gap-4 -mt-8 relative z-10 w-full max-w-full">

                {/* Avatar Compacto */}
                <div className="relative group shrink-0 z-20">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-950 border-[3px] border-[#050505] p-0.5  relative overflow-hidden box-content">
                        {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
                                <Spinner size="sm" variant="white" />
                            </div>
                        )}

                        <img
                            src={avatarPreview?.startsWith('blob') ? avatarPreview : AssetResolver.getAvatar(avatarPreview || user?.avatar_url || user?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre_display || 'T')}&background=21c99a&color=fff&bold=true&size=80`}
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
                        {user?.verificado && (
                            <motion.div 
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="flex items-center justify-center bg-[#050505] border border-emerald-500/40 rounded-[6px] p-0.5 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                title="Cuenta Verificada"
                            >
                                <Check size={11} className="text-emerald-400" strokeWidth={4} />
                            </motion.div>
                        )}
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