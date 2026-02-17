import React from 'react';
import { Calendar } from 'lucide-react';
import { useMisTurnos } from '../../hooks/useMisTurnos';
import ShiftCard from '../../components/MisTurnos/ShiftCard';
import EmptyState from '../../components/common/EmptyState';

const MisTurnosPage = () => {
    const { shifts, loading, deleteShift } = useMisTurnos();

    return (
        <div className="min-h-screen pb-20">
            {/* Header Fijo */}
            <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 pt-6 pb-6 px-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800/50 rounded-lg">
                        <Calendar size={20} className="text-zinc-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Historial de Turnos</h1>
                        <p className="text-xs text-zinc-400">Registro de trabajos realizados</p>
                    </div>
                </div>
            </div>

            {/* Lista de Turnos */}
            <div className="px-4 py-6">
                {loading ? (
                    // Skeleton Loader Simple
                    [1, 2, 3].map(i => (
                        <div key={i} className="mb-3 h-20 bg-zinc-900/30 rounded-xl animate-pulse" />
                    ))
                ) : shifts.length > 0 ? (
                    <div className="space-y-3">
                        {shifts.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} onDelete={deleteShift} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Calendar}
                        title="Sin historial de turnos"
                        description="Aquí aparecerán los turnos que hayas completado o cancelado."
                    />
                )}
            </div>
        </div>
    );
};

export default MisTurnosPage;