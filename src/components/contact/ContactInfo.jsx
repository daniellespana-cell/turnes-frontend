import React from 'react';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { configService } from '../../services/configService';

const ContactInfo = () => {
    const [contactData, setContactData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null); // TEMPORAL PARA DEBUG

    useEffect(() => {
        const fetchContactInfo = async () => {
            setIsLoading(true);
            try {
                // 🛡️ ABSTRACCIÓN SENIOR: La UI ya no conoce la tabla 'company_settings'
                const { data, error } = await configService.getPublicCompanySettings();

                if (error) {
                    console.error("Error fetching company settings:", error);
                    setFetchError(error.message || JSON.stringify(error));
                    return;
                }

                // Mapear los datos de la BD a iconos y formatos visuales
                const mappedData = data.map(setting => {
                    switch (setting.key_name) {
                        case 'contact_phone':
                            return { icon: Phone, label: "Teléfono", value: "Próximamente", description: "Soporte telefónico pronto disponible.", href: null };
                        case 'support_email':
                            return { icon: Mail, label: "Email de Soporte", value: setting.value_text, description: setting.description, href: `mailto:${setting.value_text}` };
                        case 'office_hours':
                            return { icon: Clock, label: "Horario de Atención", value: setting.value_text, description: setting.description };
                        case 'hq_location':
                            return { icon: MapPin, label: "Ubicación", value: setting.value_text, description: setting.description };
                        default:
                            return null;
                    }
                }).filter(Boolean); // Remover nulos si hay keys extra

                // Ordenar para mantener la consistencia visual (Teléfono, Email, Horario, Ubicación)
                const order = ['contact_phone', 'support_email', 'office_hours', 'hq_location'];
                mappedData.sort((a, b) => {
                    const idxA = order.indexOf(data.find(d => d.value_text === a.value)?.key_name);
                    const idxB = order.indexOf(data.find(d => d.value_text === b.value)?.key_name);
                    return idxA - idxB;
                });

                setContactData(mappedData);
            } catch (err) {
                console.error("Unexpected error fetching contact info:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContactInfo();
    }, []);


    // Skeleton Loader (Mientras carga la info de Supabase)
    if (isLoading) {
        return (
            <div className="space-y-8 p-8 bg-white/5 backdrop-blur-md border border-transparent rounded-2xl  h-full animate-pulse">
                <div className="h-8 bg-white/10 rounded w-2/3 border-b border-transparent pb-4 mb-4"></div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-4 p-3 -ml-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-white/10 rounded w-1/3"></div>
                            <div className="h-6 bg-white/10 rounded w-3/4"></div>
                            <div className="h-3 bg-white/10 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Manejo de Error de DB para ver en pantalla
    if (fetchError) {
        return (
            <div className="space-y-4 p-8 bg-red-500/10 border border-red-500/50 rounded-2xl h-full">
                <h2 className="text-xl font-bold text-red-400">Error cargando contactos</h2>
                <p className="text-sm text-red-200">{fetchError}</p>
                <p className="text-xs text-zinc-400">Por favor, toma captura de pantalla de este bloque rojo para que el asistente AI te ayude a arreglarlo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 bg-white/5 backdrop-blur-md border border-transparent rounded-2xl  h-full">
            <h2 className="text-2xl font-bold text-emerald-400 border-b border-white/10 pb-4">
                Información de Soporte
            </h2>
            {contactData.map((item, index) => {
                const Icon = item.icon;
                const isLink = !!item.href;

                // Wrapper conditional
                const Wrapper = isLink ? 'a' : 'div';
                const wrapperProps = isLink ? {
                    href: item.href,
                    className: "flex items-start space-x-4 group transition-all hover:bg-white/5 p-3 -ml-3 rounded-xl cursor-pointer hover:translate-x-1"
                } : {
                    className: "flex items-start space-x-4 p-3 -ml-3"
                };

                return (
                    <Wrapper key={index} {...wrapperProps}>
                        <div className={`flex-shrink-0 mt-1 p-3 bg-zinc-900/50 border border-transparent rounded-full ${isLink ? 'group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-colors' : ''}`}>
                            <Icon className={`w-6 h-6 ${isLink ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-emerald-400'}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">{item.label}</p>
                            <p className={`text-lg font-bold text-white ${isLink ? 'group-hover:text-emerald-400 transition-colors' : ''}`}>{item.value}</p>
                            <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                        </div>
                    </Wrapper>
                );
            })}
        </div>
    );
};

export default ContactInfo;
