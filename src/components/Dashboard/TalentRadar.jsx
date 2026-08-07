import React from 'react';
import { Sparkles, ShieldCheck, Star, ChevronRight, MapPin, Briefcase, Navigation } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationResolver } from '../../hooks/useLocationResolver';
import { talentService } from '../../services/talentService';
import { GeoService } from '../../services/geoService';

import LocationHint from '../common/LocationHint';
import RadarCard from './RadarCard';

/**
 * 🛰️ TalentRadar (Premium Interactive v5.0 — Graceful Degradation)
 * Dashboard Radar: Interactive cards with real data only.
 * Uses useLocationResolver for 4-level location cascade:
 *   GPS → Profile → IP (Cloudflare Edge) → National Showcase
 */

// Títulos dinámicos según el modo de ubicación
const RADAR_TITLES = {
    exact:       'Radar de Talento Local',
    profile:     'Radar de Talento Local',
    approximate: null, // Se construye dinámicamente con la ciudad
    national:    'Talento Destacado en Colombia',
};

const TalentRadar = () => {
    const navigate = useNavigate();
    const location = useLocationResolver();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastFetchedCoord = useRef({ lat: null, lng: null });

    useEffect(() => {
        let isCancelled = false;
        const timer = setTimeout(async () => {
            if (location.isLoading) return;

            const { lat, lng, radiusKm } = location;

            // 🛡️ ANTI-DDOS: Prevenir llamados si la coordenada no cambió significativamente (0.5km)
            if (lastFetchedCoord.current.lat) {
                const dist = GeoService.calculateDistance(lat, lng, lastFetchedCoord.current.lat, lastFetchedCoord.current.lng);
                if (dist < 0.5) return;
            }

            if (!isCancelled) setLoading(true);

            try {
                const data = await talentService.getRadarTalent(lat, lng, '', radiusKm);
                if (!isCancelled) {
                    lastFetchedCoord.current = { lat, lng };
                    setCandidates(data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }, 800);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [location.isLoading, location.lat, location.lng, location.radiusKm]);

    const hasCandidates = candidates && candidates.length > 0;

    // Título dinámico
    const radarTitle = RADAR_TITLES[location.locationMode]
        || (location.cityName ? `Talento cerca de ${location.cityName}` : 'Talento Disponible');

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_10px_#10B981]"></span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-400" />
                        {radarTitle}
                    </h3>
                </div>
                <button
                    onClick={() => navigate('/dashboard/buscar-talento')}
                    className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors font-black uppercase tracking-widest no-select"
                    type="button"
                    aria-label="Acción">
                    Ver Mapa completo
                </button>
            </div>

            {/* 📍 Banner contextual de ubicación */}
            {location.locationMode !== 'exact' && !loading && hasCandidates && (
                <LocationHint locationMode={location.locationMode} cityName={location.cityName} navigate={navigate} />
            )}

            <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide flex gap-5 snap-x snap-mandatory">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="min-w-[300px] h-[220px] rounded-3xl bg-zinc-900/60 animate-pulse" />
                        ))
                    ) : !hasCandidates ? (
                        <div className="w-full py-12 text-center glass-card border-dashed border-white/10">
                            <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Buscando talentos disponibles...</p>
                        </div>
                    ) : (
                        candidates.map((candidate, idx) => (
                            <RadarCard
                                key={candidate.id}
                                candidate={candidate}
                                idx={idx}
                                locationMode={location.locationMode}
                                showDistance={location.showDistance}
                                onView={() => navigate('/dashboard/buscar-talento', { state: { candidateId: candidate.id } })}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default TalentRadar;
