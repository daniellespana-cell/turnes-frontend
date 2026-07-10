import React from 'react';
import { Camera, Save } from 'lucide-react';
import Spinner from '../../ui/Spinner';

import { useState, useRef } from 'react';
import { compressImageToBlob } from '../../../utils/imageUtils';
import { storageService } from '../../../services/storageService';
import { AssetResolver } from '../../../utils/assetHelper';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

// --- CUSTOM HOOK FOR PROFILE LOGIC (THE BRAIN) ---
export const useProfileForm = (user, onSave) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || user?.nombre_display || '',
        bio: user?.bio || '',
        company: user?.company || user?.nombre_empresa || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            showToast('Perfil actualizado correctamente', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error al actualizar perfil', 'error');
        } finally {
            setLoading(false);
        }
    };

    return { formData, handleChange, handleSubmit, loading };
};

// --- PROFILE TAB COMPONENT (THE VIEW) ---
const ProfileTab = () => {
    const { user, actualizarPerfil } = useAuth();
    const { formData, handleChange, handleSubmit, loading } = useProfileForm(user, actualizarPerfil);
    const { showToast } = useToast();

    // Lógica de Avatar
    const fileInputRef = useRef(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || user?.avatar);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        setIsUploading(true);
        try {
            // 1. Comprimir localmente
            const compressedBlob = await compressImageToBlob(file);
            
            // Preview Instantáneo Visual
            const objectUrl = URL.createObjectURL(compressedBlob);
            setAvatarPreview(objectUrl);

            // 2. Subir a Supabase
            const storagePath = await storageService.uploadAvatar(compressedBlob, user.id);

            // 3. Guardar ruta en Postgres
            await actualizarPerfil({ avatar: storagePath });
            showToast('Foto de perfil actualizada', 'success');

        } catch (error) {
            console.error("Error avatar:", error);
            showToast(error.message || 'Error al actualizar la foto', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Perfil Público</h2>
                <p className="text-zinc-400 text-sm">Esta información será visible para otras empresas y talentos.</p>
            </div>
            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-transparent shadow-sm transition-all ">
                <div
                    className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={() => fileInputRef.current?.click()}>
                    <img
                        src={avatarPreview?.startsWith('blob') ? avatarPreview : AssetResolver.getAvatar(avatarPreview) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700 group-hover:border-emerald-500 transition-colors bg-zinc-800"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUploading ? <Spinner size="sm" variant="white" /> : <Camera size={20} className="text-white" />}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-white">Foto de Perfil</h3>
                    <p className="text-xs text-zinc-500 mb-3">Recomendado: 400x400px, PNG o JPG.</p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        type="button"
                        aria-label="Acción">
                        {isUploading ? 'Subiendo...' : 'Cambiar Foto'}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Nombre Completo" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Juan Pérez" />
                    
                    {user?.rol === 'empresa' && (
                        <InputGroup label="Nombre de la Empresa" name="company" value={formData.company} onChange={handleChange} placeholder="Ej: Turnes Tech S.A.S" />
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bio / Acerca de mí</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700 resize-none hover:border-zinc-700"
                        placeholder="Cuéntanos brevemente sobre tu experiencia..."
                    />
                    <p className="text-[10px] text-zinc-500 text-right">{formData.bio.length}/300 caracteres</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                        aria-label="Acción">
                        {loading ? <Spinner size="sm" variant="white" /> : <Save size={16} />}
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

// UI Component for clean inputs
const InputGroup = ({ label, type = "text", ...props }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-700 hover:border-zinc-700"
            {...props}
        />
    </div>
);

export default ProfileTab;
