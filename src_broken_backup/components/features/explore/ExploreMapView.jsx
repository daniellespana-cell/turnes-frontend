
const MapEmptyOverlay = () => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm pointer-events-none">
        <div className="w-14 h-14 bg-zinc-800/80 rounded-2xl flex items-center justify-center mb-4 border border-white/8">
            <MapPin size={24} className="text-zinc-500" aria-hidden="true" />
        </div>
        <p className="text-white font-bold text-sm mb-1">Sin vacantes en este mapa</p>
        <p className="text-zinc-500 text-xs text-center max-w-[200px]">
            Amplía el radio o desplaza el punto de búsqueda
        </p>
    </div>
);

const ExploreMapView = ({ mapProps, radius, setRadius, userLocation, setExplorationCenter, selectedVacancy, onClearSelection, onApply, onOpenDetail, isApplying, appliedIds }) => {
    const hasMapVacancies = (mapProps?.vacancies ?? []).some(v => v.hasCoords);
    return (
        <div key="map" role="region" aria-label="Mapa de vacantes" className="w-full relative h-[65vh] md:h-[calc(100vh-280px)] min-h-[450px] rounded-3xl overflow-hidden border border-transparent ">
            <VacancyMap {...mapProps} radius={radius} />
            {!hasMapVacancies && <MapEmptyOverlay />}
            <RadiusOverlay
                value={radius}
                onChange={setRadius}
                onRecenter={() => setExplorationCenter({ lat: userLocation.lat, lng: userLocation.lng })}
            />

            <AnimatePresence>
                {selectedVacancy && (
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        className="absolute bottom-4 left-4 right-4 z-[999]"
                        role="complementary"
                        aria-label="Vista previa de vacante"
                    >
                        <div className="max-w-md mx-auto">
                            <VacancyCard
                                vacancy={selectedVacancy}
                                onApply={onApply}
                                onOpenDetail={onOpenDetail}
                                isApplying={isApplying === selectedVacancy.id}
                                isApplied={appliedIds.has(selectedVacancy.id)}
                                hideCompanyAction={true}
                            />
                            <button
                                onClick={onClearSelection}
                                aria-label="Cerrar vista previa"
                                className="w-full mt-2 py-2.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest bg-zinc-900/90 backdrop-blur-md rounded-xl border border-transparent hover:text-white transition-colors"
                            >
                                Cerrar Preview
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExploreMapView;
