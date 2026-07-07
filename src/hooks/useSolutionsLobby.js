import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useBoostPurchase } from './useBoostPurchase';
import { VacancyService } from '../services/vacancyService';
import { configService } from '../services/configService';
import { Rocket, ShieldCheck, Briefcase } from 'lucide-react';

/**
 * useSolutionsLobby: Hook de Lógica de Negocio (SSOT).
 * Separa la consulta a la BD de la Interfaz de Usuario.
 */
export const useSolutionsLobby = (onCreate) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const boost = useBoostPurchase();

    const [usageStats, setUsageStats] = useState(null);
    const [microservices, setMicroservices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const cargarDatos = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [statsRes, microRes] = await Promise.all([
                VacancyService.getUsageStats(user.id),
                configService.getMicroservices()
            ]);
            if (statsRes.data) setUsageStats(statsRes.data);
            if (microRes.data) setMicroservices(microRes.data);
        } catch (error) {
            console.error("[useSolutionsLobby] Error sync:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        cargarDatos();
        window.addEventListener('turnes_vacancy_update', cargarDatos);
        window.addEventListener('vacanteFinalizada', cargarDatos);
        return () => {
            window.removeEventListener('turnes_vacancy_update', cargarDatos);
            window.removeEventListener('vacanteFinalizada', cargarDatos);
        };
    }, [cargarDatos]);

    const services = useMemo(() => {
        const isEmpresa = user?.role === 'empresa';
        if (!isEmpresa) return []; // 🧹 CLEANUP: Postulantes no tienen servicios en lobby

        const isFixedIncluded = usageStats?.isIncluded || false;
        const remaining = usageStats?.remainingFree || 0;
        const limit = usageStats?.totalLimit || 0;

        const getServiceData = (key) => {
            const s = microservices.find(item => 
                (item.icon_key === key || item.title.toLowerCase().includes(key.toLowerCase())) &&
                item.target_audience === 'EMPRESAS'
            );
            return s ? { id: s.id, price: parseFloat(s.price), title: s.title, desc: s.description } : null;
        };

        const boostData = getServiceData('rocket') || getServiceData('impulso') || { id: 'boost', price: 7000, title: 'Impulso Urgente' };
        const verifyData = getServiceData('shield-check') || getServiceData('verificación') || { id: 'verify', price: 0, title: 'Verificación Elite' };

        return [
            {
                id: boostData.id,
                actionId: 'boost',
                title: boostData.title,
                icon: Rocket,
                color: 'text-orange-400',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/20',
                price: boostData.price,
                desc: boostData.desc || 'Posiciona tu vacante en el top global.',
                actionType: 'boost',
                label: 'Activar'
            },
            {
                id: verifyData.id,
                actionId: 'verify',
                title: verifyData.title,
                icon: ShieldCheck,
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/20',
                price: verifyData.price,
                desc: verifyData.desc || 'Sello de confianza oficial de Turnes.',
                actionType: 'buy',
                label: user?.verificado ? 'Certificado' : 'Certificar'
            },
            {
                id: 'fixed',
                title: 'Contrato Fijo',
                icon: Briefcase,
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/20',
                price: isFixedIncluded ? 0 : 19900,
                desc: isLoading 
                    ? 'Sincronizando beneficios...' 
                    : limit > 0 
                        ? `Beneficio activo: Te quedan ${remaining} de ${limit} vacantes fijas.`
                        : 'Publica ofertas para turnos fijos y recurrentes sin límites.',
                actionType: 'create',
                label: isFixedIncluded ? 'Usar Ahora' : 'Publicar'
            },
        ];
    }, [user?.role, user?.verificado, usageStats, microservices, isLoading]);

    const handleAction = (serv) => {
        if (serv.actionType === 'create') {
            if (onCreate) onCreate();
            navigate('/publicar');
        } else if (serv.actionId === 'verify') {
            navigate(`/plan-action/${serv.id}`);
        } else if (serv.actionId === 'boost') {
            boost.openBoostFlow();
        }
    };

    return {
        services,
        isLoading,
        handleAction,
        boostProps: boost
    };
};
