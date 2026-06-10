import React, { Suspense } from 'react';
import Configuracion from '../../components/configuracion/Configuracion';


const ConfiguracionPage = () => {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Cargando configuración...</div>}>
            <Configuracion />
        </Suspense>
    );
};

export default ConfiguracionPage;
