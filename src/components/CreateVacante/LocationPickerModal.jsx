import React from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { PickerHeader, PickerFooter } from './LocationPicker/MapParts';
import LocationControls from './LocationPicker/LocationControls';
import LocationMap from './LocationPicker/LocationMap';

import { useLocationPicker } from '../../hooks/useLocationPicker';

/**
 * 📍 LocationPickerModal — Production-Ready
 *
 * FIXES:
 *  - Animación solo en opacity (no scale) — scale cambia el bounding box
 *    durante el mount de Leaflet y provoca el "Black Void" en desktop
 *  - isMapReady se activa con delay de 250ms en el hook (ver useLocationPicker)
 *  - No usa transform: translate para centrar (evita conflictos con Leaflet)
 */
const LocationPickerModal = (props) => {
    const { isOpen, onClose } = props;
    const {
        tempPos, setTempPos,
        resolvedAddress, isConfirmed,
        isResolving, isLocating, isMapReady,
        validInitial,
        handleUseMyLocation, handleConfirm, resolveLocationData
    } = useLocationPicker(props);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">

                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* MODAL — opacity-only animation para no interferir con Leaflet */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-4xl h-full max-h-[85vh] bg-[#0a0a0a] border border-transparent rounded-[2rem]  overflow-hidden flex flex-col"
                    >
                        <header className="shrink-0">
                            <PickerHeader onClose={onClose} />
                        </header>

                        {/* MAP AREA: flex-1 + relative para que Leaflet ocupe todo */}
                        <div className="flex-1 relative bg-[#111] overflow-hidden">
                            {isMapReady && (
                                <>
                                    <LocationMap
                                        center={validInitial}
                                        pos={tempPos}
                                        setPos={setTempPos}
                                        onDragEnd={resolveLocationData}
                                    />
                                    <LocationControls
                                        isResolving={isResolving}
                                        address={resolvedAddress}
                                        onUseMyLocation={handleUseMyLocation}
                                        isLocating={isLocating}
                                    />
                                </>
                            )}
                        </div>

                        <footer className="shrink-0">
                            <PickerFooter onConfirm={handleConfirm} isConfirmed={isConfirmed} />
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LocationPickerModal;
