import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    isNotificationSupported,
    getNotificationPermission,
    safeRequestNotificationPermission,
    safeNotifyNative
} from '../utils/notificationHelpers';

describe('notificationHelpers', () => {
    const originalNotification = window.Notification;
    const originalVisibilityState = document.visibilityState;

    afterEach(() => {
        // Restaurar estado global
        if (originalNotification) {
            window.Notification = originalNotification;
        } else {
            delete window.Notification;
        }
        Object.defineProperty(document, 'visibilityState', {
            value: originalVisibilityState,
            writable: true,
            configurable: true
        });
        vi.restoreAllMocks();
    });

    describe('isNotificationSupported', () => {
        it('retorna false si window.Notification no existe', () => {
            delete window.Notification;
            expect(isNotificationSupported()).toBe(false);
        });

        it('retorna false si window.Notification es un objeto mock/stub sin requestPermission (Bug Anti-fingerprinting)', () => {
            // Caso exacto del Sentry TypeError: Notification.requestPermission is not a function
            window.Notification = {};
            expect(isNotificationSupported()).toBe(false);
        });

        it('retorna false si requestPermission no es una función', () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = 'not-a-function';
            expect(isNotificationSupported()).toBe(false);
        });

        it('retorna true cuando la Notification API es completa y válida', () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn();
            expect(isNotificationSupported()).toBe(true);
        });
    });

    describe('getNotificationPermission', () => {
        it('retorna "denied" si la API no está soportada', () => {
            window.Notification = {};
            expect(getNotificationPermission()).toBe('denied');
        });

        it('retorna el permiso real si la API está soportada', () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn();
            window.Notification.permission = 'granted';
            expect(getNotificationPermission()).toBe('granted');
        });

        it('retorna "denied" si el acceso a permission lanza una excepción', () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn();
            Object.defineProperty(window.Notification, 'permission', {
                get() {
                    throw new Error('Access denied by privacy shield');
                },
                configurable: true
            });
            expect(getNotificationPermission()).toBe('denied');
        });
    });

    describe('safeRequestNotificationPermission', () => {
        it('retorna "denied" sin lanzar error si no está soportado (Anti-fingerprint guard)', async () => {
            window.Notification = {}; // No requestPermission
            const result = await safeRequestNotificationPermission();
            expect(result).toBe('denied');
        });

        it('resuelve correctamente cuando requestPermission retorna una Promesa', async () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn().mockResolvedValue('granted');
            const result = await safeRequestNotificationPermission();
            expect(result).toBe('granted');
            expect(window.Notification.requestPermission).toHaveBeenCalledTimes(1);
        });

        it('soporta la API con callback legado cuando no retorna Promesa', async () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn((cb) => {
                cb('granted');
                return undefined;
            });
            const result = await safeRequestNotificationPermission();
            expect(result).toBe('granted');
        });

        it('captura excepciones síncronas de navegadores restringidos sin propagar error', async () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn(() => {
                throw new Error('Blocked by User Agent policy');
            });
            const result = await safeRequestNotificationPermission();
            expect(result).toBe('denied');
        });

        it('captura rechazos asíncronos sin propagar error', async () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn().mockRejectedValue(new Error('Rejected promise'));
            const result = await safeRequestNotificationPermission();
            expect(result).toBe('denied');
        });
    });

    describe('safeNotifyNative', () => {
        beforeEach(() => {
            Object.defineProperty(document, 'visibilityState', {
                value: 'hidden',
                writable: true,
                configurable: true
            });
        });

        it('no hace nada y retorna null si la pestaña está visible', () => {
            Object.defineProperty(document, 'visibilityState', {
                value: 'visible',
                writable: true,
                configurable: true
            });
            const res = safeNotifyNative('Título', { body: 'Cuerpo' });
            expect(res).toBeNull();
        });

        it('no hace nada y retorna null si el permiso no es "granted"', () => {
            window.Notification = function MockNotification() {};
            window.Notification.requestPermission = vi.fn();
            window.Notification.permission = 'default';

            const res = safeNotifyNative('Título', { body: 'Cuerpo' });
            expect(res).toBeNull();
        });

        it('instancia Notification si la pestaña está oculta y permiso es "granted"', () => {
            const MockConstructor = vi.fn();
            MockConstructor.requestPermission = vi.fn();
            MockConstructor.permission = 'granted';
            window.Notification = MockConstructor;

            safeNotifyNative('Título', { body: 'Cuerpo' });
            expect(MockConstructor).toHaveBeenCalledWith('Título', { body: 'Cuerpo' });
        });

        it('captura TypeError de Illegal constructor (Chrome Android) sin propagar excepción', () => {
            const MockConstructor = vi.fn(() => {
                throw new TypeError("Failed to construct 'Notification': Illegal constructor. Use ServiceWorkerRegistration.showNotification().");
            });
            MockConstructor.requestPermission = vi.fn();
            MockConstructor.permission = 'granted';
            window.Notification = MockConstructor;

            expect(() => {
                const res = safeNotifyNative('Título', { body: 'Cuerpo' });
                expect(res).toBeNull();
            }).not.toThrow();
        });
    });
});
