import React from 'react';
import { Briefcase, Building2 } from 'lucide-react';

const RoleSelection = ({ setRole }) => {
    return (
        <div className="w-full max-w-sm mx-auto animate-fade-in p-2">
            <h2 className="text-lg font-bold text-white mb-4 text-center tracking-tight">Selecciona tu perfil</h2>

            <div className="grid grid-cols-2 gap-3">

                {/* Micro-Card Talento */}
                <button
                    onClick={() => setRole && setRole('jobseeker')}
                    className="group relative flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-300 border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:-translate-y-0.5 active:scale-95"
                >
                    <div className="mb-2 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors">
                        Postulante
                    </span>
                </button>

                {/* Micro-Card Empresa */}
                <button
                    onClick={() => setRole && setRole('company')}
                    className="group relative flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-300 border border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-0.5 active:scale-95"
                >
                    <div className="mb-2 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                        Empresa
                    </span>
                </button>

            </div>

            <p className="text-zinc-500 text-[10px] text-center mt-3">
                Continúa para acceder a Turnes
            </p>
        </div>
    );
};

export default RoleSelection;