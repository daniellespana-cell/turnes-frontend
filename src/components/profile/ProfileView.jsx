import React from 'react';
import { Star, MapPin, Briefcase, ShieldCheck } from 'lucide-react';
import ReviewItem from '../detallePerfil/ReviewItem';
import TalentKPIs from '../business/talent-profile/TalentKPIs';

import { AssetResolver } from '../../utils/assetHelper';

/**
 * 👤 ProfileView (Componente Presentacional Puro)
 * Extraído de DetallePerfilPage para respetar DRY. 
 * Puede ser renderizado en una Página completa o en un Modal Lateral/BottomSheet.
 */
export const ProfileView = ({ profile, reviews = [], isCompany = false, companyData = null, isModalMode = false }) => {
    
    // Normalized Data Extraction
    const displayName = isCompany ? (companyData?.nombre_comercial || profile.nombre_empresa) : profile.nombre_display;
    const displayAvatar = isCompany ? (companyData?.logo_url || profile.avatar_url) : profile.avatar_url;
    const isVerified = isCompany ? companyData?.verificado : profile.verificado;

    const formattedRating = Number(profile.calificacion || profile.rating || 5.0).toFixed(1);

    return (
        <div className={`relative overflow-hidden flex flex-col justify-start w-full ${isModalMode ? 'p-6' : 'bg-[#0a0a0a] rounded-[2rem] border border-transparent  p-6 md:p-8'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* --- SECCIÓN 1: IDENTIDAD SUPERIOR --- */}
            <section className="flex flex-col md:flex-row items-center md:items-start md:gap-6 text-center md:text-left relative z-10 w-full mt-2">

                <div className="relative shrink-0 mb-4 md:mb-0">
                    {/* Avatar con anillo azul brillante si está verificado */}
                    <div className={`rounded-full p-[3px] ${
                        isVerified
                            ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                            : 'bg-transparent'
                    }`}>
                        {displayAvatar ? (
                            <img src={AssetResolver.getAvatar(displayAvatar)} alt={displayName} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover bg-zinc-900 block" />
                        ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-zinc-900 flex items-center justify-center text-3xl font-bold text-zinc-700">
                                {displayName?.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}
                    </div>

                    {isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full ring-4 ring-[#0a0a0a] shadow-[0_0_12px_rgba(59,130,246,0.8)]" title="Perfil Verificado Elite">
                            <ShieldCheck size={14} strokeWidth={3} />
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-center h-full">

                    <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">
                        {isCompany ? 'Empresa' : 'Talento Turnes'}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                            {displayName || 'Usuario de Turnes'}
                        </h1>
                        {isVerified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                                <ShieldCheck size={11} strokeWidth={3} />
                                Elite Verificado
                            </span>
                        )}
                    </div>

                    {(profile.sector || companyData?.sector_industrial) && (
                        <p className="text-zinc-400 text-sm font-medium mb-4">
                            {isCompany ? companyData.sector_industrial : profile.sector}
                        </p>
                    )}

                    {/* 📊 MÉTRICAS UNIFICADAS (SSOT) */}
                    <div className="pt-2">
                        <TalentKPIs 
                            rating={profile.rating}
                            exitos={profile.exitos}
                            distancia={profile.distancia_mts}
                            ubicacion={profile.direccion}
                        />
                    </div>
                </div>
            </section>

            <div className="w-full h-px bg-white/5 my-6" />

            {/* --- SECCIÓN 2: BIOGRAFÍA & HABILIDADES --- */}
            <section className="flex flex-col gap-5 relative z-10">
                <div>
                    <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2 flex items-center gap-2">
                        <Briefcase size={14} className="text-blue-500" />
                        Acerca del Perfil
                    </h3>
                    {profile.bio ? (
                        <p className="text-[13px] md:text-sm text-zinc-300 leading-relaxed font-light">
                            {profile.bio}
                        </p>
                    ) : (
                        <p className="text-zinc-600 italic text-sm font-light">
                            Este perfil prefiere hablar con acciones, aún no hay biografía redactada.
                        </p>
                    )}
                </div>

                {!isCompany && profile.skills?.length > 0 && (
                    <div>
                        <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
                            Especialidades Profesionales
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.skills.map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2.5 py-1 bg-zinc-900 border border-transparent rounded-md text-[10px] text-zinc-400 font-medium tracking-wide"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <div className="w-full h-px bg-white/5 my-6" />

            {/* --- SECCIÓN 3: OPINIONES EN LÍNEA --- */}
            <section className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 font-bold">
                        Últimos Comentarios
                    </h3>
                    {reviews.length > 0 && (
                        <span className="text-[9px] text-zinc-600 font-mono border border-transparent px-2 py-0.5 rounded-full">
                            {reviews.length} reseñas
                        </span>
                    )}
                </div>

                {reviews.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {reviews.map(review => (
                            <ReviewItem key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Star size={24} className="text-zinc-800 mx-auto mb-3" />
                        <p className="text-zinc-500 text-xs">Aún no hay reseñas registradas para este perfil.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProfileView;
