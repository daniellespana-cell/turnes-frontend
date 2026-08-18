import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppliedVacancies } from '../hooks/useAppliedVacancies';
import { useVacancyScoring } from '../hooks/useVacancyScoring';
import { MatchService } from '../services/matchService';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user-123', name: 'Talento Test', skills: ['barista', 'mesero'] },
        isAuthenticated: true,
    })
}));

// Mock applicationService
vi.mock('../services/applicationService', () => ({
    applicationService: {
        getAppliedVacancyIds: vi.fn().mockResolvedValue({ data: ['vac-applied-1'], error: null }),
        subscribeToUserApplications: vi.fn().mockReturnValue({ id: 'channel-test' }),
        unsubscribeChannel: vi.fn(),
    }
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: Infinity },
        },
    });
    return ({ children }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('🛡️ Hook Lifecycle Integration Tests (SSOT & Reactivity)', () => {

    describe('useAppliedVacancies (TanStack Query Cache)', () => {
        it('debe inicializar el Set con los IDs obtenidos del servicio', async () => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useAppliedVacancies(), { wrapper });

            // Esperar a que React Query resuelva la consulta
            await vi.waitFor(() => {
                expect(result.current.appliedIds.has('vac-applied-1')).toBe(true);
            });
            expect(result.current.appliedIds.has('vac-not-applied')).toBe(false);
        });

        it('debe ejecutar mutación optimista con markApplied y rollback con revertApplied', async () => {
            const wrapper = createWrapper();
            const { result } = renderHook(() => useAppliedVacancies(), { wrapper });

            await vi.waitFor(() => {
                expect(result.current.appliedIds.has('vac-applied-1')).toBe(true);
            });

            // 1. Mutación optimista en 0ms
            act(() => {
                result.current.markApplied('vac-optimistic-999');
            });

            await vi.waitFor(() => {
                expect(result.current.appliedIds.has('vac-optimistic-999')).toBe(true);
            });

            // 2. Rollback en caso de error
            act(() => {
                result.current.revertApplied('vac-optimistic-999');
            });

            await vi.waitFor(() => {
                expect(result.current.appliedIds.has('vac-optimistic-999')).toBe(false);
            });
        });
    });

    describe('useVacancyScoring (Scoring & Reactive Exclusion)', () => {
        it('debe filtrar instantáneamente las vacantes contenidas en appliedIds', () => {
            const mockVacancies = [
                { id: 'v1', title: 'Barista Experto', skills: ['barista'], rawLat: 4.60, rawLng: -74.08, category: 'TODOS', type: 'completo', esUrgente: false },
                { id: 'v2', title: 'Mesero de Fin de Semana', skills: ['mesero'], rawLat: 4.60, rawLng: -74.08, category: 'TODOS', type: 'completo', esUrgente: false },
                { id: 'v3', title: 'Cocinero', skills: ['cocina'], rawLat: 4.60, rawLng: -74.08, category: 'TODOS', type: 'completo', esUrgente: false },
            ];

            const userLocation = {
                lat: 4.60,
                lng: -74.08,
                user: { skills: ['barista', 'mesero'] }
            };

            const filters = { types: [], schedules: [], skills: [], urgente: false };
            const appliedIds = new Set(['v1']); // v1 ya fue postulada

            const { result } = renderHook(() => useVacancyScoring(
                mockVacancies,
                userLocation,
                filters,
                'TODOS',
                '',
                30,
                appliedIds
            ));

            const visible = result.current.filteredVacancies;
            expect(visible.find(v => v.id === 'v1')).toBeUndefined();
            expect(visible.find(v => v.id === 'v2')).toBeDefined();
        });
    });

    describe('MatchService Scoring Stability', () => {
        it('debe calcular scoring sobre perfiles y vacantes sin referencias huérfanas', () => {
            const mockVacancies = [
                { id: 'v10', title: 'Barista', skills: ['barista'], lat: 4.6, lng: -74.0, empresas: { rating: 5, verified: true } },
            ];
            const userProfile = { skills: ['barista'], lat: 4.6, lng: -74.0 };

            const scored = MatchService.scoreVacancies(mockVacancies, userProfile);
            expect(scored).toBeDefined();
            expect(scored.length).toBe(1);
            expect(scored[0].matchScore).toBeGreaterThanOrEqual(75);
            expect(scored[0].isHighMatch).toBe(scored[0].matchScore >= 80);
        });
    });
});
