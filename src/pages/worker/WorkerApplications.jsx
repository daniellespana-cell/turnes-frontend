import React from 'react';
import { Briefcase } from 'lucide-react';
import { useWorkerApplications } from '../../hooks/useWorkerApplications';
import ShiftCard from '../../components/MisTurnos/ShiftCard';
import EmptyState from '../../components/common/EmptyState';

const WorkerApplications = () => {
    const { applications, loading } = useWorkerApplications();

    return (
        <div className="min-h-screen pb-20 animate-fade-in">
            {/* Header Fijo */}
            <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5 pt-6 pb-6 px-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Briefcase size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Postulaciones</h1>
                        <p className="text-xs text-zinc-400">Tus solicitudes y turnos programados</p>
                    </div>
                </div>
            </div>

            {/* Lista de Postulaciones */}
            <div className="px-4 py-6">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="mb-3 h-24 bg-zinc-900/30 rounded-xl animate-pulse" />
                    ))
                ) : applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <ShiftCard
                                key={app.id}
                                shift={app}
                                // 🚀 Navigation Wiring
                                onChat={() => window.location.href = `/dashboard/chat/${app.id}`}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Briefcase}
                        title="No tienes postulaciones"
                        description="Explora las vacantes disponibles y postúlate a tu próximo empleo."
                        actionLabel="Explorar Vacantes"
                        onAction={() => window.location.href = '/dashboard/explorar'} // O useNavigation
                    />
                )}
            </div>
        </div>
    );
};

export default WorkerApplications;
