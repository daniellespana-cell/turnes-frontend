import { useMemo } from 'react';

export const useChatFinance = (candidato, config) => {
    return useMemo(() => {
        const sueldo = candidato?.payment || candidato?.sueldo || config?.metadata?.payment || 50000;
        const cargoCalculado = candidato?.billingConfig?.cargoServicio ||
            candidato?.comisionServicio ||
            (sueldo * 0.06);

        return {
            cargoServicio: Math.round(cargoCalculado),
            pagoPersonal: sueldo,
            plan: candidato?.billingConfig?.plan || config?.metadata?.plan || 'Básico',
            tieneMontoValido: cargoCalculado > 0
        };
    }, [config, candidato]);
};
