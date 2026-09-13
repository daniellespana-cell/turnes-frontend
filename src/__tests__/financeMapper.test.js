import { describe, it, expect } from 'vitest';
import { financeMapper } from '../utils/financeMapper';

describe('financeMapper.mapShiftTransaction', () => {
    it('debe retornar null si la postulacion es null o undefined', () => {
        expect(financeMapper.mapShiftTransaction(null)).toBeNull();
        expect(financeMapper.mapShiftTransaction(undefined)).toBeNull();
    });

    it('debe mapear correctamente un turno completado con empresa y salario', () => {
        const mockShift = {
            id: 'pos-12345678-abcd',
            status: 'finalizado',
            created_at: '2026-09-10T14:00:00Z',
            vacante: {
                id: 'vac-999',
                titulo: 'Bartender Evento',
                pago_monto: 120000,
                salario: null,
                tipo_turno: 'fijo',
                fecha_turno: '2026-09-10',
                empresas: {
                    id: 'emp-111',
                    nombre_comercial: 'Bar La Pasion',
                    logo_url: 'https://cdn.example.com/logo.png'
                }
            }
        };

        const result = financeMapper.mapShiftTransaction(mockShift);

        expect(result).not.toBeNull();
        expect(result.id).toBe('pos-12345678-abcd');
        expect(result.business).toBe('Bar La Pasion');
        expect(result.amount).toBe(120000);
        expect(result.type).toBe('deposit');
        expect(result.status).toBe('Finalizado');
        expect(result.reference).toBe('TURNO-pos-1234');
        expect(result.metadata.titulo).toBe('Bartender Evento');
    });

    it('debe usar el fallback de titulo de vacante si la empresa no tiene nombre comercial', () => {
        const mockShift = {
            id: 'pos-777',
            status: 'contratado',
            created_at: '2026-09-11T10:00:00Z',
            vacante: {
                id: 'vac-555',
                titulo: 'Mesero Nocturno',
                salario: 85000,
                pago_monto: 0
            }
        };

        const result = financeMapper.mapShiftTransaction(mockShift);

        expect(result.business).toBe('Mesero Nocturno');
        expect(result.amount).toBe(85000);
        expect(result.status).toBe('Contratado');
        expect(result.type).toBe('deposit');
    });

    it('debe mapear una lista completa filtrando elementos invalidos', () => {
        const list = [
            {
                id: 'pos-1',
                status: 'finalizado',
                vacante: { titulo: 'Turno 1', pago_monto: 50000 }
            },
            null,
            {
                id: 'pos-2',
                status: 'finalizado',
                vacante: { titulo: 'Turno 2', pago_monto: 70000 }
            }
        ];

        const results = financeMapper.mapShiftTransactions(list);
        expect(results).toHaveLength(2);
        expect(results[0].id).toBe('pos-1');
        expect(results[1].id).toBe('pos-2');
    });
});
