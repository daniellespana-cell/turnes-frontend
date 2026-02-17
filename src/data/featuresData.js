// ===============================
// CARACTERÍSTICAS Y VENTAJAS DE TURNES
// ===============================

export const coreFeatures = [
    {
        id: 1,
        icon: "Zap",
        title: "Contratación Instantánea",
        description: "Publica un turno y recibe postulantes cualificados en minutos, no en horas. Ideal para emergencias y alta rotación.",
        target: "Empresas",
        color: "text-brand-success"
    },
    {
        id: 2,
        icon: "ShieldCheck",
        title: "Sistema Anti-Fuga Reforzado",
        description: "Ocultamos datos sensibles y bloqueamos la reputación fuera de Turnes, asegurando que las contrataciones ocurran y se paguen dentro de la plataforma.",
        target: "Seguridad",
        color: "text-brand-primary"
    },
    {
        id: 3,
        icon: "Star",
        title: "Reputación y Calificaciones Únicas",
        description: "Construye tu historial. Las calificaciones se traducen en 'Badges' de confiabilidad para empresas cumplidas y trabajadores de alto rendimiento (Top Worker).",
        target: "Ambos",
        color: "text-yellow-400"
    },
    {
        id: 4,
        icon: "Wallet",
        title: "Gestión de Pagos y Billetera",
        description: "Pagos y cobros inmediatos por turno, eliminando la fricción y la espera bancaria. Transparencia total en comisiones.",
        target: "Ambos",
        color: "text-emerald-500"
    },
    {
        id: 5,
        icon: "Search",
        title: "Filtros Avanzados y Geolocalización",
        description: "Encuentra candidatos exactos por ubicación, experiencia o microservicios adquiridos (como verificación premium).",
        target: "Empresas",
        color: "text-cyan-400"
    },
    {
        id: 6,
        icon: "Briefcase",
        title: "Contratación Fija Flexible",
        description: "Publica puestos fijos pagando una tarifa única sin necesidad de plan mensual. La plataforma más flexible para todo tipo de contrato.",
        target: "Empresas",
        color: "text-indigo-400"
    },
];

// Mapeo de íconos para consumo en el componente (similar a IconMap)
import { Zap, ShieldCheck, Star, Wallet, Search, Briefcase } from 'lucide-react';
export const FeatureIconMap = { Zap, ShieldCheck, Star, Wallet, Search, Briefcase };