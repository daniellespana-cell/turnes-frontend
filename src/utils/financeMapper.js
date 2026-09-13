/**
 * 💰 FINANCE MAPPER (SSOT)
 * Centraliza la transformación de datos financieros entre PostgreSQL y React.
 * Elimina la necesidad de mapeos ad-hoc en hooks y servicios.
 */

export const financeMapper = {
    /**
     * Normaliza un movimiento de la DB al formato de negocio
     */
    mapTransaction: (mov) => {
        if (!mov) return null;

        const dateObj = new Date(mov.created_at);
        
        // 🔄 ALINEACIÓN DE VOCABULARIO (Legacy Support + New Webhook)
        const isIncome = ['INGRESO', 'DEPOSITO', 'RECHARGE', 'CREDIT'].includes(mov.tipo);
        
        // Determinar nombre visual (Business/Concepto)
        let businessName = mov.concepto || 'Transacción';
        const itemType = mov.metadata?.item_type;
        
        if (itemType === 'plan') {
            businessName = `Suscripción Plan ${mov.metadata.item_id?.toUpperCase() || ''}`;
        } else if (itemType === 'recharge' || mov.tipo === 'INGRESO') {
            businessName = 'Recarga de Saldo';
        }

        // Extracción de info de contraparte (Para Admin Ledger)
        const profile = mov.billeteras?.perfiles;
        const counterpartName = profile?.empresas?.nombre_comercial || profile?.nombre_display || 'Usuario Externo';
        const counterpartEmail = profile?.email || 'N/A';

        return {
            id: mov.id,
            business: businessName, // Compatibilidad con Worker UI
            counterpart: counterpartName, // Para Admin UI
            counterpartEmail: counterpartEmail,
            date: dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
            dateFull: mov.created_at,
            amount: Math.abs(Number(mov.monto || 0)),
            monto: Number(mov.monto || 0), // Valor con signo para Admin
            status: mov.estado || 'completado',
            type: isIncome ? 'deposit' : 'payment', // Normalización visual
            rawType: mov.tipo,
            reference: mov.referencia,
            metadata: mov.metadata || {}
        };
    },

    /**
     * Mapea una lista completa de transacciones
     */
    mapTransactions: (list) => {
        return (list || []).map(financeMapper.mapTransaction).filter(Boolean);
    },

    /**
     * 🚀 SSOT: Normaliza una postulación finalizada (turno completado) al formato de transacción para la UI de Finanzas
     * @param {Object} postulacion
     */
    mapShiftTransaction: (postulacion) => {
        if (!postulacion) return null;

        const vacante = postulacion.vacante || {};
        const empresa = vacante.empresas || {};
        const dateRaw = vacante.fecha_turno || postulacion.created_at;
        const dateObj = new Date(dateRaw);
        const amount = Number(vacante.pago_monto || vacante.salario || 0);

        return {
            id: postulacion.id,
            business: empresa.nombre_comercial || vacante.titulo || 'Turno Finalizado',
            counterpart: empresa.nombre_comercial || 'Empresa Contratante',
            counterpartEmail: 'N/A',
            date: !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
                : 'Reciente',
            dateFull: dateRaw,
            amount: Math.abs(amount),
            monto: Math.abs(amount),
            status: postulacion.status === 'finalizado' ? 'Finalizado' : 'Contratado',
            type: 'deposit', // Ingreso visual (verde +)
            rawType: 'SHIFT_EARNING',
            reference: `TURNO-${String(postulacion.id || '').slice(0, 8)}`,
            metadata: {
                vacante_id: vacante.id,
                titulo: vacante.titulo,
                tipo_turno: vacante.tipo_turno
            }
        };
    },

    /**
     * Mapea una lista completa de turnos finalizados
     */
    mapShiftTransactions: (list) => {
        return (list || []).map(financeMapper.mapShiftTransaction).filter(Boolean);
    }
};
