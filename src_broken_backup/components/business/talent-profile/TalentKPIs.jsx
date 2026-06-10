
/**
 * 📊 TalentKPIs (Atomic Logic)
 * Centraliza la lógica de visualización de métricas.
 */
export const TalentKPIs = ({ rating, exitos, distancia, ubicacion }) => {
    // 🛡️ Lógica de visualización cruda
    // 🛡️ REFUERZO SSOT: Reflejamos la verdad de la DB sin filtros
    const displayRating = Number(rating || 0).toFixed(1);
    const displayExitos = exitos || 0;
    const displayDistance = distancia 
        ? `${(Number(distancia) / 1000).toFixed(1)} km` 
        : (ubicacion || 'Zona remota');
    
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                <Star size={13} className="text-amber-500 fill-amber-500" />
                <span className="text-[12px] font-bold text-zinc-300">{displayRating}</span>
            </div>
            
            <div className="w-px h-3 bg-zinc-800" />
            
            <div className="flex items-center gap-1 text-emerald-500">
                <CalendarCheck2 size={13} />
                <span className="text-[12px] font-bold">{displayExitos} Éxitos</span>
            </div>

            <div className="w-px h-3 bg-zinc-800" />

            <div className="flex items-center gap-1 text-zinc-500">
                <MapPin size={12} />
                <span className="text-[12px] font-medium truncate max-w-[150px]">{displayDistance}</span>
            </div>
        </div>
    );
};
