import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const contactInfo = [
    { icon: Phone, label: "Teléfono", value: "+57 (601) 555-5555", description: "Llamada directa para soporte urgente.", href: "tel:+576015555555" },
    { icon: Mail, label: "Email de Soporte", value: "soporte@turnes.co", description: "Respuesta en menos de 24 horas hábiles.", href: "mailto:soporte@turnes.co" },
    { icon: Clock, label: "Horario de Atención", value: "Lun - Vie: 8:00 AM - 6:00 PM (COT)", description: "Horario continuado de soporte técnico." },
    { icon: MapPin, label: "Ubicación", value: "Bogotá D.C., Colombia", description: "Sede administrativa (solo por cita)." },
];

const ContactInfo = () => {
    return (
        <div className="space-y-8 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl h-full">
            <h2 className="text-2xl font-bold text-emerald-400 border-b border-white/10 pb-4">
                Información de Soporte
            </h2>
            {contactInfo.map((item, index) => {
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
                        <div className={`flex-shrink-0 mt-1 p-3 bg-zinc-900/50 border border-white/5 rounded-full ${isLink ? 'group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-colors' : ''}`}>
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
