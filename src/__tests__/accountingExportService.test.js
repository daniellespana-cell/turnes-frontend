import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    AccountingExportService,
    sanitizeCSVCell,
    formatAccountingCurrency,
    TURNES_TAX_INFO
} from '../services/accountingExportService';

describe('AccountingExportService (The Stripe Model - Contabilidad)', () => {
    describe('sanitizeCSVCell', () => {
        it('retorna comillas vacías para null o undefined', () => {
            expect(sanitizeCSVCell(null)).toBe('""');
            expect(sanitizeCSVCell(undefined)).toBe('""');
        });

        it('duplica comillas internas para cumplir con RFC 4180', () => {
            const result = sanitizeCSVCell('Turno "Especial" Nocturno');
            expect(result).toBe('"Turno ""Especial"" Nocturno"');
        });

        it('neutraliza inyecciones de fórmulas maliciosas para Excel (=, +, -, @)', () => {
            expect(sanitizeCSVCell('=1+1')).toBe('"\'=1+1"');
            expect(sanitizeCSVCell('+cmd|')).toBe('"\'+cmd|"');
            expect(sanitizeCSVCell('-20')).toBe('"\'-20"');
            expect(sanitizeCSVCell('@SUM(A1:A10)')).toBe('"\'@SUM(A1:A10)"');
        });
    });

    describe('formatAccountingCurrency', () => {
        it('formatea montos colombianos en pesos COP sin decimales', () => {
            const formatted = formatAccountingCurrency(150000);
            expect(formatted).toContain('150.000');
            expect(formatted).toContain('$');
        });

        it('maneja valores 0 o nulos con gracia', () => {
            const formatted = formatAccountingCurrency(0);
            expect(formatted).toContain('0');
        });
    });

    describe('buildCSVContent', () => {
        const mockRecords = [
            {
                movimiento_id: 'mov-1234-uuid',
                fecha: '2026-09-08T15:30:00Z',
                tipo_movimiento: 'PAGO_TURNO',
                concepto: 'Desbloqueo de contacto: Juan Pérez (Mesero)',
                referencia: 'STEP1_PAY_app-999',
                monto_total: 106000,
                tarifa_operativa: 100000,
                comision_turnes: 6000,
                trabajador_nombre: 'Juan Pérez Niño',
                categoria_turno: 'Restaurantes',
                vacante_titulo: 'Mesero Fin de Semana',
                empresa_nombre: 'Restaurante El Portal S.A.S.',
                empresa_nit: '900.123.456-7'
            }
        ];

        it('debe iniciar con el Byte Order Mark (BOM \uFEFF) para compatibilidad con Excel en español', () => {
            const csv = AccountingExportService.buildCSVContent(mockRecords);
            expect(csv.charCodeAt(0)).toBe(0xFEFF);
        });

        it('debe utilizar punto y coma (;) como delimitador estándar contable en Colombia', () => {
            const csv = AccountingExportService.buildCSVContent(mockRecords);
            const lines = csv.split('\r\n');
            const header = lines[0].replace('\uFEFF', '');
            
            expect(header).toContain('Fecha;Hora;Comprobante_ID;NIT_Empresa');
            expect(lines.length).toBe(2); // Cabecera + 1 registro
        });

        it('debe preservar caracteres especiales en español (ñ, tildes) y desglosar tarifas', () => {
            const csv = AccountingExportService.buildCSVContent(mockRecords);
            expect(csv).toContain('Juan Pérez Niño');
            expect(csv).toContain('100000');
            expect(csv).toContain('6000');
            expect(csv).toContain('106000');
        });
    });

    describe('downloadCSV', () => {
        beforeEach(() => {
            vi.stubGlobal('URL', {
                createObjectURL: vi.fn(() => 'blob:mock-url'),
                revokeObjectURL: vi.fn()
            });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('lanza un error si el array de registros está vacío', () => {
            expect(() => {
                AccountingExportService.downloadCSV([]);
            }).toThrow('No hay movimientos registrados');
        });

        it('crea el enlace de descarga en el DOM y dispara el clic', () => {
            const appendSpy = vi.spyOn(document.body, 'appendChild');
            const mockRecords = [{
                monto_total: 50000,
                concepto: 'Turno de prueba',
                fecha: new Date().toISOString()
            }];

            const success = AccountingExportService.downloadCSV(mockRecords, { nombre_comercial: 'Empresa Test' });
            expect(success).toBe(true);
            expect(appendSpy).toHaveBeenCalled();
            expect(window.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('TURNES_TAX_INFO', () => {
        it('mantiene la información legal tributaria corporativa de Turnes', () => {
            expect(TURNES_TAX_INFO.RAZON_SOCIAL).toBe('Turnes S.A.S.');
            expect(TURNES_TAX_INFO.NIT).toBeDefined();
            expect(TURNES_TAX_INFO.LEGAL_LEGEND).toContain('Artículos 771-2');
        });
    });
});
