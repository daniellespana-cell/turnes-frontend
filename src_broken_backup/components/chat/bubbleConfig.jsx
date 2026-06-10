
/**
 * 📚 DICCIONARIO DE TRADUCCIONES DE BUBBUJAS
 * Separa la lógica de strings del renderizado visual (Anti-Spaghetti).
 */
export const BUBBLE_TRANSLATIONS = {
    chat_created: {
        trabajador: {
            title: 'Conexión Segura Establecida',
            instruction: 'Has hecho match. La empresa evaluará tu perfil. Responde a sus mensajes para avanzar en el proceso.'
        },
        empresa: {
            title: 'Match Exitoso',
            instruction: 'El talento cumple con tus pre-requisitos. Evalúa su perfil dialogando por este medio y luego procede con el Paso 1 (Pago de Comisión) para desbloquear validación en video.'
        },
        default: {
            title: 'Match Inicializado',
            instruction: 'Iniciando conexión segura.'
        }
    },
    payment_success: {
        trabajador: {
            title: 'Pago de Comisión Verificado',
            instruction: 'La empresa ha cubierto la comisión de reclutamiento exitosamente. El canal ha sido desbloqueado. Por favor espera a ser invitado a videollamada (Paso 2).'
        },
        empresa: {
            title: 'Pago de Comisión Exitoso',
            instruction: 'Tu pago se ha procesado correctamente. El canal de contacto ha sido desbloqueado. Para garantizar la confiabilidad, por favor procede con el Paso 2: Validación Visual.'
        },
        default: {
            title: 'Comisión Procesada',
            instruction: 'Canal desbloqueado.'
        }
    },
    contract_signed: {
        trabajador: {
            title: '🎉 ¡FELICITACIONES! HAS SIDO SELECCIONADO',
            instruction: 'El turno ha sido confirmado oficialmente. Por favor preséntate puntualmente según lo acordado.'
        },
        empresa: {
            title: '📄 ACUERDO EMITIDO Y FIRMADO',
            instruction: 'El acuerdo ha sido formalizado y la vacante cubierta. Notificado al candidato.'
        },
        default: {
            title: 'Contrato Digital',
            instruction: 'Acuerdo confirmado.'
        }
    },
    video_invitation: {
        trabajador: {
            title: '🔔 DEBES UNIRTE A VIDEOLLAMADA',
            instruction: 'El jefe desea conocerte brevemente. Tómate un momento y acepta cuando estés listo.'
        },
        empresa: {
            title: '🎥 INVITACIÓN ENVIADA: ESPERANDO',
            instruction: 'Esperando a que el candidato acepte la invitación. Una vez acepte, iniciaremos la conexión.'
        },
        default: {
            title: 'Solicitud de Conexión',
            instruction: 'Esperando respuesta...'
        }
    },
    call_summary: { // system_info + subtype=call_summary
        trabajador: {
            title: 'Validación Completada',
            instruction: 'Excelente. Espera a que la empresa emita el acuerdo.'
        },
        empresa: {
            title: 'Has completado la Validación',
            instruction: 'Excelente. Ya puedes proceder a firmar el acuerdo con el candidato.'
        },
        default: {
            title: 'Resumen',
            instruction: 'Llamada finalizada.'
        }
    },
    rehire_offer: {
        trabajador: {
            title: '🤝 PROPUESTA DE RECONTRATACIÓN',
            instruction: 'El empleador desea volver a trabajar contigo en un turno directo. Revisa los detalles de la oferta.'
        },
        empresa: {
            title: '🤝 PROPUESTA ENVIADA',
            instruction: 'Has enviado una oferta de recontratación directa. Esperando respuesta del talento.'
        },
        default: {
            title: 'Propuesta Directa',
            instruction: 'Revisando propuesta...'
        }
    },
    rehire_accepted: {
        trabajador: {
            title: 'Oferta Aceptada',
            instruction: 'Has aceptado la recontratación exitosamente. Puedes usar el chat para afinar detalles.'
        },
        empresa: {
            title: 'Oferta Aceptada',
            instruction: 'El talento ha aceptado la recontratación. Te invitamos a ponerte al tanto sobre detalles del turno y proceder a firmar el acuerdo.'
        },
        default: {
            title: 'Oferta Aceptada',
            instruction: 'Recontratación aceptada.'
        }
    },
    rehire_declined: {
        trabajador: {
            title: 'Oferta Declinada',
            instruction: 'Has declinado la oferta exitosamente. El chat ha sido cerrado.'
        },
        empresa: {
            title: 'Oferta Declinada',
            instruction: 'El talento ha declinado la oferta de recontratación. Se ha devuelto la comisión descontada a tu billetera y el chat ha sido cerrado.'
        },
        default: {
            title: 'Oferta Declinada',
            instruction: 'Recontratación declinada.'
        }
    }
};


/**
 * 🎨 DICCIONARIO DE ESTILOS DE BURBUJAS 
 */
export const getBubbleStyleConfig = (type) => {
    switch (type) {
        case 'video_invitation':
            return {
                icon: <Video size={14} className="text-blue-400" />,
                borderColor: 'border-blue-500/30',
                bgGradient: 'from-blue-500/5 to-transparent',
                title: 'Solicitud de Conexión',
                textColor: 'text-blue-200'
            };
        case 'contract_signed':
            return {
                icon: <FileSignature size={14} className="text-purple-400" />,
                borderColor: 'border-purple-500/30',
                bgGradient: 'from-purple-500/5 to-transparent',
                title: 'Contrato Digital',
                textColor: 'text-purple-200'
            };
        case 'payment_success':
            return {
                icon: <Banknote size={14} className="text-yellow-400" />,
                borderColor: 'border-yellow-500/30',
                bgGradient: 'from-yellow-500/5 to-transparent',
                title: 'Pago Procesado',
                textColor: 'text-yellow-200'
            };
        case 'system_info':
            return {
                icon: <Clock size={14} className="text-emerald-400" />,
                borderColor: 'border-emerald-500/30',
                bgGradient: 'from-emerald-500/5 to-transparent',
                title: 'Resumen',
                textColor: 'text-emerald-200'
            };
        case 'prompt_video_invite':
            return {
                icon: <Video size={14} className="text-emerald-400" />,
                borderColor: 'border-emerald-500/50',
                bgGradient: 'from-emerald-500/10 to-transparent',
                title: 'Siguiente Paso',
                textColor: 'text-emerald-400'
            };
        case 'prompt_contract':
            return {
                icon: <FileSignature size={14} className="text-indigo-400" />,
                borderColor: 'border-indigo-500/50',
                bgGradient: 'from-indigo-500/10 to-transparent',
                title: 'Acción Requerida',
                textColor: 'text-indigo-400'
            };
        case 'rehire_offer':
            return {
                icon: <Check size={14} className="text-amber-400" />,
                borderColor: 'border-amber-500/50',
                bgGradient: 'from-amber-500/10 to-transparent',
                title: 'Recontratación',
                textColor: 'text-amber-400'
            };
        default:
            return {
                icon: <AlertCircle size={14} className="text-zinc-400" />,
                borderColor: 'border-zinc-700',
                bgGradient: 'from-zinc-800/50 to-transparent',
                title: 'Sistema',
                textColor: 'text-zinc-300'
            };
    }
};

/**
 * Resolutor Principal de Traducción UI
 */
export const resolveBubbleText = (message, userRole) => {
    const { type, text } = message;
    const { subtype, instruction } = message.metadata || {};

    let lookupKey = type;
    if (type === 'system_info') {
        if (subtype === 'call_summary') lookupKey = 'call_summary';
        else if (subtype === 'rehire_accepted') lookupKey = 'rehire_accepted';
        else if (subtype === 'rehire_declined') lookupKey = 'rehire_declined';
        else if (subtype === 'chat_created') lookupKey = 'chat_created';
        else if (subtype === 'payment_success') lookupKey = 'payment_success';
    }

    const dic = BUBBLE_TRANSLATIONS[lookupKey];
    if (dic) {
        const roleData = dic[userRole] || dic.default;
        return {
            displayTitle: roleData.title,
            displayInstruction: roleData.instruction
        };
    }

    // Fallback original
    return {
        displayTitle: text || 'Notificación del Sistema',
        displayInstruction: instruction || null
    };
};
