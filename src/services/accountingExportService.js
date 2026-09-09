/**
 * 📊 ACCOUNTING EXPORT SERVICE (The Stripe Model)
 *
 * Single Source of Truth para generación y exportación de comprobantes y
 * reportes contables oficiales para empresas usuarias de Turnes.co.
 *
 * Características:
 * - Cero dependencias pesadas (0 KB de bundle extra).
 * - Compatible con Siigo, Alegra, Helisa, World Office y Microsoft Excel.
 * - Formato UTF-8 con BOM (\uFEFF) y delimitador ';' (estándar contable en Colombia).
 * - Protección contra inyección de fórmulas CSV (=, +, -, @).
 * - Soporte legal para el Art. 771-2 del Estatuto Tributario Colombiano.
 */

import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { logger } from '../utils/logger';

export const TURNES_TAX_INFO = {
    RAZON_SOCIAL: 'Turnes S.A.S.',
    NIT: '901.847.231-4',
    PAIS: 'Colombia',
    EMAIL_CONTACTO: 'facturacion@turnes.co',
    WEB: 'https://www.turnes.co',
    LEGAL_LEGEND: 'Documento equivalente y soporte contable de contratación electrónica conforme a los Artículos 771-2 y concordantes del Estatuto Tributario Colombiano.'
};

/**
 * Sanitiza campos de texto para evitar vulnerabilidades de inyección de fórmulas CSV.
 * @param {string|number|null} value 
 * @returns {string}
 */
export const sanitizeCSVCell = (value) => {
    if (value === null || value === undefined) return '""';
    const str = String(value).trim();
    
    // Si empieza con caracteres ejecutables en Excel (=, +, -, @), prefijar con apóstrofe
    let safeStr = str;
    if (/^[=+\-@]/.test(safeStr)) {
        safeStr = `'${safeStr}`;
    }

    // Escapar comillas dobles duplicándolas según RFC 4180
    const escaped = safeStr.replace(/"/g, '""');
    return `"${escaped}"`;
};

/**
 * Formatea valores monetarios al estándar contable colombiano (sin decimales para COP)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatAccountingCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(num);
};

export const AccountingExportService = {
    /**
     * Consulta el resumen contable consolidado a través del RPC de PostgreSQL.
     * @param {string} empresaId 
     * @param {Date|string} [startDate] 
     * @param {Date|string} [endDate] 
     */
    async getAccountingSummary(empresaId, startDate, endDate) {
        if (!empresaId) return { data: [], error: 'Empresa no especificada' };

        const start = startDate ? new Date(startDate).toISOString() : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const end = endDate ? new Date(endDate).toISOString() : new Date().toISOString();

        try {
            const query = supabase.rpc('rpc_get_accounting_summary', {
                p_empresa_id: empresaId,
                p_fecha_inicio: start,
                p_fecha_fin: end
            });

            const result = await BaseService.handle(query);

            // Si el RPC falla o no está disponible en el entorno local, retornar array vacío con log
            if (result.error) {
                logger.warn('[AccountingExportService] Fallback en consulta contable:', result.error);
                return { data: [], error: result.error };
            }

            return { data: result.data || [], error: null };
        } catch (err) {
            logger.error('[AccountingExportService] Error consultando contabilidad:', err);
            return { data: [], error: err.message };
        }
    },

    /**
     * Construye el contenido CSV listo para Siigo / Alegra / Excel con cabecera BOM UTF-8
     * @param {Array<object>} records - Registros devueltos por el RPC o la tabla de movimientos
     * @param {object} [empresaInfo] - Datos de la empresa (nombre_comercial, nit_rut)
     * @returns {string} Contenido CSV con BOM UTF-8
     */
    buildCSVContent(records = [], empresaInfo = {}) {
        const headers = [
            'Fecha',
            'Hora',
            'No. Comprobante',
            'NIT Empresa',
            'Razón Social Empresa',
            'Tipo de Movimiento',
            'Trabajador / Beneficiario',
            'Detalle del Turno o Concepto',
            'Valor del Turno (COP)',
            'Comisión Turnes (COP)',
            'Total Debitado (COP)',
            'Referencia de Pago',
            'Estado'
        ];

        const rows = records.map((item) => {
            const dateObj = item.fecha ? new Date(item.fecha) : new Date();
            const dateStr = dateObj.toLocaleDateString('es-CO');
            const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

            const compId = item.referencia || item.movimiento_id || 'N/A';
            const nitEmpresa = item.empresa_nit || empresaInfo.nit_rut || 'N/A';
            const nombreEmpresa = item.empresa_nombre || empresaInfo.nombre_comercial || 'Empresa Turnes';
            
            // Descripción amigable del tipo de movimiento
            let tipo = 'Pago de Turno';
            if (item.tipo_movimiento === 'RECARGA' || compId.startsWith('REC_') || item.tipo_movimiento === 'INGRESO') {
                tipo = 'Recarga de Saldo';
            } else if (item.tipo_movimiento === 'PAGO_SERVICIO') {
                tipo = 'Suscripción o Servicio';
            }

            const tercero = item.trabajador_nombre || 'Turnes S.A.S.';
            const concepto = item.concepto || item.vacante_titulo || 'Servicio de Talento';

            // Valores numéricos limpios para que Excel permita sumas y fórmulas
            const tarifaOperativa = Math.round(Number(item.tarifa_operativa || 0));
            const comision = Math.round(Number(item.comision_turnes || 0));
            const total = Math.round(Number(item.monto_total || 0));

            return [
                sanitizeCSVCell(dateStr),
                sanitizeCSVCell(timeStr),
                sanitizeCSVCell(compId),
                sanitizeCSVCell(nitEmpresa),
                sanitizeCSVCell(nombreEmpresa),
                sanitizeCSVCell(tipo),
                sanitizeCSVCell(tercero),
                sanitizeCSVCell(concepto),
                tarifaOperativa,
                comision,
                total,
                sanitizeCSVCell(compId),
                sanitizeCSVCell('Aprobado')
            ].join(';');
        });

        // Delimitador ';' estándar para software contable colombiano y Excel hispano
        const csvBody = [headers.map(h => `"${h}"`).join(';'), ...rows].join('\r\n');

        // \uFEFF es el Byte Order Mark (BOM) que fuerza a Microsoft Excel a interpretar UTF-8
        return `\uFEFF${csvBody}`;
    },

    /**
     * Descarga directamente en el navegador el archivo CSV contable sin dependencias externas
     * @param {Array<object>} records 
     * @param {object} empresaInfo 
     * @param {string} [customFilename] 
     */
    downloadCSV(records, empresaInfo = {}, customFilename = null) {
        if (!records || records.length === 0) {
            throw new Error('No hay movimientos registrados en el período seleccionado para exportar.');
        }

        const csvContent = this.buildCSVContent(records, empresaInfo);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const nowStr = new Date().toISOString().slice(0, 10);
        const filename = customFilename || `Turnes_Reporte_Contable_${nowStr}.csv`;

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Limpieza de memoria
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 200);

        return true;
    }
};

export default AccountingExportService;
