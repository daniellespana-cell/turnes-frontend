# 💬 INSTRUCCIONES DE CONTEXTO: SISTEMA DE CHAT

> **INSTRUCCIÓN ESTRICTA PARA LA IA:** Cada vez que inicie una sesión y el usuario te pida modificar algo relacionado con los chats, **DEBES LEER ESTE ARCHIVO ANTES DE TOCAR CUALQUIER CÓDIGO** para entender la arquitectura actual y no destruir la infraestructura existente ni cometer errores del pasado (Deadlocks y Fugas de Memoria).

---

## 1. ARQUITECTURA DE MICROSERVICIOS (`src/services/chat/`)

El monolito original (`ChatStorage.js`) fue refactorizado y **destruido**. Ahora usamos una arquitectura bajo el patrón **Facade**. Está estrictamente prohibido volver a juntar el código o inyectar dependencias pesadas entre los submódulos.

*   `index.js` (Orquestador / Facade): La **ÚNICA** pieza que React puede ver o importar. Coordina y expone los métodos legados (`subscribe`, `sendMessage`, `getSnapshot`).
*   `chatState.js` (Memoria Inmutable & Reactividad): Maneja el patrón **PubSub** puro. Contiene el historial y previene *Race Conditions* mezclando HTTP con WebSockets.
*   `chatConversations.js` (Motor de la Barra Lateral): Ejecuta la carga inicial pesada de la lista de contactos. No toca los mensajes individuales.
*   `chatNetwork.js` (Transporte HTTP Puro): Hace los `FETCH` a Supabase. **REGLA DE HIERRO (PREVENCIÓN DE DEADLOCK):** NUNCA debe llamar a `authService.getSession()`. Solo consume `this._cachedToken` actualizado por `onAuthStateChange`. Hacer lo contrario congelará el hilo de UI en dispositivos sin red debido a `navigator.locks`.
*   `chatRealtime.js` (Websockets de Supabase): Mantiene la suscripción abierta a la tabla `mensajes`.
*   `chatOfflineStorage.js` (Cola PWA): Guarda paquetes al `localStorage` si no hay internet. **Incluye Firewall F12:** Purga el caché si detecta JSON corrupto o strings >5000 chars.

---

## 2. REGLAS DE SEGURIDAD EN BASE DE DATOS (Supabase)

Si propones cambios SQL, respeta estas reglas que blindan el servidor de Turnes contra Vandalismo de Infraestructura:

*   **RLS `can_access_chat`:** Las políticas dependen de una función SQL limpia que verifica `postulaciones` y `vacantes`. NO hacer subconsultas planas que tiran error `400 Ambiguous`.
*   **Anti-DoS (Protección de Spam):** El trigger `trigger_message_rate_limit` bloquea si se envían **más de 4 mensajes en 3 segundos**. (El FrontEnd debe manejar este rechazo gracefully).
*   **Anti-Bloat (Protección de Disco):** El candado `check_tamano_mensaje` rechaza rotunda y explícitamente cualquier mensaje de **> 5000 caracteres**. (El FrontEnd debe prevenir que el usuario intente enviarlos).
*   **Anti-DLP (Prevención de Fugas SQL):** El trigger `check_dlp_leakage()` intercepta la inserción de mensajes y destruye TODOS los espacios, símbolos y "LeetSpeak" (ej. cambiar O por 0). Si en esa cadena resultante hay 7 números o un teléfono explícito, la base de datos devuelve **Error 400 (DLP_POLICY_VIOLATION)**.
*   **Anti-DLP de Perfiles/Vacantes:** El mismo muro de arena anterior se aplica a `perfiles.nombre_display` y a `vacantes.descripcion` para evitar Carga de Troyanos.

---

## 3. SEGURIDAD Y COMPORTAMIENTO FRONTEND EN REACT

*   **Importación Única:** Todo componente debe importar `import { ChatStorage } from '@/services/chat';` o el respectivo path. Jamás apuntar a submódulos internos.
*   **Interfaz Optimista (UI):** El manejo visual y temporal lo hace automáticamente `chatNetwork.js` al inyectar un ID `temp-` que la UI dibuja como un relojito o de color opaco. NUNCA recargar la página entera para mostrar un mensaje nuevo.
*   **Filtro DLP Frontend (Memoria de Sesión y NLP Semántico):** El hook `useChatSecurity.js` implementa un buffer de memoria que retiene hasta los últimos 50 mensajes de una sesión (Indefinite Array) para bloquear ataques de evasión lenta ("Slow Drip"). Además, cuenta con un Motor NLP Semántico (Nivel InDriver) que traduce números escritos en texto ("uno", "treintaydos", "veintises") a sus valores numéricos exactos antes de pasarlos por el Muro Regex de 7 dígitos.
*   **Firewall Anti-Envenenamiento (Offline Cache):** El archivo `chatOfflineStorage.js` intercepta todo lo que React intenta leer de `localStorage` (Cola PWA). Si un atacante usa `F12` para inyectar basura o mensajes >5000 letras directamente al caché, el Firewall aniquila la memoria corrupta previniendo un Crash.

---

## 4. RENDERIZADO DINÁMICO DE SISTEMA (On-The-Fly Rendering)

El protocolo de chat genera "mensajes del sistema" (ej. "Contrato Firmado" o "Invitación a Video"). Para evitar duplicar datos en la base de datos y mantener el *Single Source of Truth*:
*   Supabase solo almacena **UN** evento inmutable quemado por el emisor (Ej. Empresa emite `contract_signed`).
*   **La UI Local (React):** A través del componente `SystemActionBubble.jsx`, intercepta el texto estático de la BD y lo **traduce al vuelo** dependiendo del `userRole` del lector. (Ej. La Empresa ve "Acuerdo Emitido", el Candidato ve "¡Felicitaciones!").
*   **UI Asimétrica:** Los botones de acción de las burbujas (Aceptar / Declinar Video) están condicionados por rol. La empresa solicita, pero **solo el candidato interactúa con los botones**.

---

## 5. REGLAS DE NEGOCIO Y LÍMITES (Winner-Takes-All)

Para evitar abusos en el sistema de contratación, la Base de Datos impone límites estrictos usando Stored Procedures (RPC):
*   **Límite de Videollamadas (`rpc_request_video_validation`):** Una vacante solo permite hasta **4 validaciones de video comprobadas** con diferentes candidatos. Al superar el límite, Supabase lanza la excepción `MAX_VIDEO_VALIDATIONS_REACHED` bloqueando la interfaz de la Empresa.
*   **Efecto InDriver (`rpc_confirm_agreement`):** Cuando la empresa firma el acuerdo final (Paso 3) con un candidato ganador, el Trigger SQL **automáticamente** rechaza a todos los demás postulantes compitiendo por la misma vacante y cierra (`status='cerrada'`) la vacante a nivel global.

---

## 6. CIERRE DE CICLO (Red de Confianza)

El **Paso 4 (Finalizar y Calificar)** es el mecanismo anti-represalias del sistema. 
Al firmarse (`rpc_seal_chat`), el estado final del candidato pasa a `contratado` y en chat queda finalizado. **Nunca uses `finalizado` como hardcode de UI sin leer el BD `isClosed` o `status = 'contratado'`**.

---

## 7. UI DE LISTA DE CHATS (MESSENGER STYLE)

La lista de chats usa un diseño minimalista extraído en `ChatListItem.jsx`. 
Reglas de UI a seguir:
*   **Agnosticismo de Roles**: La UI de la lista lee *`targetAvatar = chat.candidateAvatar || chat.empresaAvatar || chat.avatar`*. No pases el avatar por props viejos ni abuses de LocalStorage.
*   **Estado Inteligente Binario**: Usa exclusivamente la constante `isClosedStatus` para determinar si el chat está **Activo** o **Finalizado**. Este badge es un candado gris opaco si el workflow se completó (`status = finalizado`, `status = contratado` o `isClosed`).
*   **Limpieza Fuerte offline**: El componente padre de la lista destruye los diccionarios cacheados (`turnes_chat_offline_queue`) en cada montado inicial para prevenir envenenamiento de memoria.

*   **Aislamiento Frontal:** Inmediatamente después de confirmar un acuerdo, el chat se recubre en un estado `isClosed=true`, deshabilitando el input de texto (`ChatInput.jsx disabled`).
*   **Sello de Bóveda (`rpc_seal_chat`):** El botón de cierre invoca este microservicio SQL que avanza la postulación al paso 4 (Sellado).
*   **Retención UI (`status = contratado`):** A diferencia de métodos antiguos, la BD **fuerza/mantiene** el estatus en `contratado` (incluso si venía de `pendiente` o `chat_iniciado`). Esto garantiza que, al ser pateado el usuario a `/dashboard/candidatos`, la sub-pestaña "Pendientes" pueda renderizar la tarjeta del trabajador basado en su estado `contratado` para que la empresa lo califique con estrellas de manera asíncrona.
