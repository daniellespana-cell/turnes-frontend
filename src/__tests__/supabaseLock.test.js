import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resilientAuthLock } from '../services/supabaseClient';

describe('🛡️ Certificación de ResilientAuthLock (Anti-Deadlock Standard)', () => {
    let originalNavigator;

    beforeEach(() => {
        originalNavigator = globalThis.navigator;
    });

    afterEach(() => {
        Object.defineProperty(globalThis, 'navigator', {
            value: originalNavigator,
            writable: true,
            configurable: true
        });
        vi.restoreAllMocks();
    });

    it('debe ejecutar fn() y retornar su resultado cuando navigator.locks funciona correctamente', async () => {
        const mockLocksRequest = vi.fn().mockImplementation(async (name, options, callback) => {
            return await callback();
        });

        Object.defineProperty(globalThis, 'navigator', {
            value: {
                locks: {
                    request: mockLocksRequest
                }
            },
            writable: true,
            configurable: true
        });

        const fn = vi.fn().mockResolvedValue({ token: 'jwt_valido' });
        const result = await resilientAuthLock('lock:auth-token', 2000, fn);

        expect(mockLocksRequest).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ token: 'jwt_valido' });
    });

    it('debe auto-recuperarse y ejecutar fn() cuando navigator.locks hace timeout (AbortError de pestaña suspendida)', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Simulamos el fallo de timeout que arroja el navegador cuando hay un deadlock
        const abortError = new Error('The lock request was aborted');
        abortError.name = 'AbortError';

        const mockLocksRequest = vi.fn().mockRejectedValue(abortError);

        Object.defineProperty(globalThis, 'navigator', {
            value: {
                locks: {
                    request: mockLocksRequest
                }
            },
            writable: true,
            configurable: true
        });

        const fn = vi.fn().mockResolvedValue({ token: 'jwt_recuperado_resiliente' });
        
        // NO debe lanzar error
        const result = await resilientAuthLock('lock:auth-token', 2000, fn);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ token: 'jwt_recuperado_resiliente' });
        expect(warnSpy).toHaveBeenCalled();
    });

    it('debe ejecutar fn() directamente si navigator.locks no está disponible en el entorno', async () => {
        Object.defineProperty(globalThis, 'navigator', {
            value: {},
            writable: true,
            configurable: true
        });

        const fn = vi.fn().mockResolvedValue({ token: 'jwt_directo' });
        const result = await resilientAuthLock('lock:auth-token', 2000, fn);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ token: 'jwt_directo' });
    });
});
