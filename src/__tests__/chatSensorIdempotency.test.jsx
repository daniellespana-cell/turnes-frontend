import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PROTOCOL_STEPS } from '../services/contractService';

/**
 * 🧪 Test de Certificación de Idempotencia y Cero Bucles de Render
 * Simula el comportamiento del sensor reactivo de useChatLogic.
 */
describe('🛡️ Certificación de Idempotencia del Sensor de Chat (Anti-Loop Guarantee)', () => {
    let dispatchedEvents = [];

    beforeEach(() => {
        dispatchedEvents = [];
        window.addEventListener('turnes_contract_update', (e) => {
            dispatchedEvents.push(e);
        });
    });

    const useMockChatSensor = (messages, onStartVideo, onCerrarVideo) => {
        const [contractStatus, setContractStatus] = useState({ step: 1, isPaid: true });
        const lastProcessedMsgIdRef = useRef(null);

        const triggerDomainSync = useCallback(() => {
            window.dispatchEvent(new CustomEvent('turnes_contract_update'));
        }, []);

        useEffect(() => {
            if (!messages || messages.length === 0) return;
            const lastMsg = messages[messages.length - 1];
            if (!lastMsg) return;

            const msgId = lastMsg.id || `${lastMsg.created_at || ''}_${lastMsg.type}_${lastMsg.content || ''}`;
            if (lastProcessedMsgIdRef.current === msgId) {
                return;
            }
            lastProcessedMsgIdRef.current = msgId;

            if (lastMsg.type === 'video_accepted' && onStartVideo) {
                onStartVideo();
            }

            const isVideoEndMsg = 
                lastMsg.type === 'video_ended' || 
                lastMsg.type === 'video_declined' ||
                lastMsg.metadata?.subtype === 'call_summary' ||
                lastMsg.metadata?.subtype === 'video_declined';

            if (isVideoEndMsg && onCerrarVideo) {
                onCerrarVideo();
            }

            const isVideoValidated = lastMsg.type === 'video_ended' || lastMsg.metadata?.subtype === 'call_summary';
            if (isVideoValidated) {
                setContractStatus(prev => {
                    if (prev.step >= PROTOCOL_STEPS.VIDEO_VALIDATED) return prev;
                    return {
                        ...prev,
                        step: PROTOCOL_STEPS.VIDEO_VALIDATED
                    };
                });
                triggerDomainSync();
            }
        }, [messages, onStartVideo, onCerrarVideo, triggerDomainSync]);

        return { contractStatus, setContractStatus };
    };

    it('debe procesar un mensaje de video_ended exactamente UNA vez y no entrar en bucle', async () => {
        const onStartVideo = vi.fn();
        const onCerrarVideo = vi.fn();

        const initialMessages = [
            { id: 'msg-1', type: 'text', content: 'Hola' },
            { id: 'msg-2', type: 'video_ended', metadata: { subtype: 'call_summary' } }
        ];

        const { result, rerender } = renderHook(
            ({ msgs }) => useMockChatSensor(msgs, onStartVideo, onCerrarVideo),
            { initialProps: { msgs: initialMessages } }
        );

        // Verificamos que se ejecutó onCerrarVideo exactamente una vez
        expect(onCerrarVideo).toHaveBeenCalledTimes(1);
        expect(dispatchedEvents.length).toBe(1);
        expect(result.current.contractStatus.step).toBe(PROTOCOL_STEPS.VIDEO_VALIDATED);

        // Simulamos múltiples re-renders del componente (como ocurre con setState o context)
        rerender({ msgs: initialMessages });
        rerender({ msgs: initialMessages });
        rerender({ msgs: initialMessages });

        // El cerrojo de idempotencia debe evitar que se vuelva a disparar
        expect(onCerrarVideo).toHaveBeenCalledTimes(1);
        expect(dispatchedEvents.length).toBe(1);
    });

    it('debe reaccionar limpiamente ante nuevos mensajes entrantes sin reiniciar bucles anteriores', async () => {
        const onStartVideo = vi.fn();
        const onCerrarVideo = vi.fn();

        let msgs = [{ id: 'msg-1', type: 'text', content: 'Hola' }];

        const { result, rerender } = renderHook(
            ({ msgsProps }) => useMockChatSensor(msgsProps, onStartVideo, onCerrarVideo),
            { initialProps: { msgsProps: msgs } }
        );

        expect(dispatchedEvents.length).toBe(0);

        // Llega invitación aceptada
        msgs = [...msgs, { id: 'msg-2', type: 'video_accepted' }];
        rerender({ msgsProps: msgs });
        expect(onStartVideo).toHaveBeenCalledTimes(1);

        // Llega fin de llamada
        msgs = [...msgs, { id: 'msg-3', type: 'video_ended', metadata: { subtype: 'call_summary' } }];
        rerender({ msgsProps: msgs });
        expect(onCerrarVideo).toHaveBeenCalledTimes(1);
        expect(result.current.contractStatus.step).toBe(PROTOCOL_STEPS.VIDEO_VALIDATED);
        expect(dispatchedEvents.length).toBe(1);

        // Re-render con los mismos mensajes
        rerender({ msgsProps: msgs });
        expect(onCerrarVideo).toHaveBeenCalledTimes(1);
        expect(dispatchedEvents.length).toBe(1);
    });
});
