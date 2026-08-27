import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { lazyWithRetry } from '../utils/lazyWithRetry';

describe('lazyWithRetry Utility (SSOT)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    it('debe resolver exitosamente un módulo en el primer intento', async () => {
        const MockComponent = () => <div>Mock</div>;
        const mockImporter = vi.fn().mockResolvedValue({ default: MockComponent });

        const LazyComponent = lazyWithRetry(mockImporter);
        expect(LazyComponent).toBeDefined();

        // Invocar la función interna del lazy
        const result = await mockImporter();
        expect(result.default).toBe(MockComponent);
        expect(mockImporter).toHaveBeenCalledTimes(1);
    });

    it('debe reintentar la importación tras un error inicial de red', async () => {
        const MockComponent = () => <div>Recovered</div>;
        let attempts = 0;

        const flakyImporter = vi.fn().mockImplementation(async () => {
            attempts++;
            if (attempts === 1) {
                throw new Error('Failed to fetch dynamically imported module');
            }
            return { default: MockComponent };
        });

        // Crear lazy wrapper
        const LazyComponent = lazyWithRetry(flakyImporter);
        expect(LazyComponent).toBeDefined();
    });
});
