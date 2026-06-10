
export const TalentProfileContent = ({ isLoading, error, profile, reviews }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                <Spinner size="md" variant="emerald" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Sincronizando Hoja de Vida...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <AlertCircle size={32} className="text-zinc-700" />
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight">
                    No pudimos cargar el perfil
                </p>
                <span className="text-[10px] text-zinc-600">{error}</span>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"> 
            <ProfileView 
                profile={profile} 
                reviews={reviews}
                isCompany={profile.rol === 'empresa'}
                companyData={profile.empresas?.[0]}
                isModalMode={true}
            />
        </div>
    );
};
