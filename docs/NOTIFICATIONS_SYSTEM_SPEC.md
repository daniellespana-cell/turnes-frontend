---
title: "Turnes Notifications & Messaging Architecture Specification"
system: "Turnes Enterprise Event & Notification Broker"
status: "Active / SSOT"
last_updated: "2026-09-12"
target_audience: ["AI Agents (Cursor, Claude, Gemini, Antigravity)", "Fullstack Developers", "Software Architects"]
keywords: ["notifications", "chat", "realtime", "supabase", "observer", "SSOT", "bounded-context", "badges"]
---

# 🔔 NOTIFICATIONS & MESSAGING ARCHITECTURE SPECIFICATION (SSOT)

> **MANIFIESTO ARQUITECTÓNICO OBLIGATORIO**  
> Este documento es la **Única Fuente de Verdad (Single Source of Truth - SSOT)** para el subsistema de notificaciones y mensajería en Turnes.  
> Cualquier modificación de código realizada por **desarrolladores o inteligencias artificiales** DEBE cumplir rigurosamente con las reglas, límites de dominio y contratos descritos aquí.

---

## 1. Regla de Oro Invariable: Aislamiento Estricto de Dominios

El sistema de eventos de Turnes se divide en dos dominios **completamente herméticos e independientes**:

| Dimensión | Dominio A: Alertas del Sistema (🔔) | Dominio B: Mensajería Privada (💬) |
| :--- | :--- | :--- |
| **Punto Visual de Entrada** | Icono de Campanita (`NotificationsMenu.jsx`) | Icono de Chat (`MessageCircle` en `AppNavbar.jsx`) |
| **Color del Badge** | 🔴 **Rojo** (`from-red-500 to-red-600`) | 🟢 **Verde Esmeralda** (`from-emerald-400 to-teal-600`) |
| **Tabla DB Principal** | `public.notificaciones` | `public.mensajes` & `public.turnes_chats` |
| **Fuente de Verdad (SSOT)** | `NotificationsContext.jsx` (React Context) | `ChatStorage` / `chatState.js` (External Store) |
| **Eventos Permitidos** | `JOB_APPLIED`, `PAYMENT_SUCCESS`, `CONTRACT_SIGNED`, `RATING_RECEIVED`, `INVITATION_ACCEPTED`, etc. | `mensajes` INSERT / UPDATE, eventos de chat en vivo |
| **Evento Prohibido** | ❌ `CHAT_MESSAGE` (NUNCA entra a este estado) | ❌ Eventos de pagos, postulaciones o vacantes |
| **Comportamiento al Clic** | Abre dropdown con historial de alertas | Redirige a `/dashboard/chats` o hilo de chat |

### ⚠️ AXIOMA DE SEGURIDAD PARA IAs Y DEVS:
1. **Bajo ninguna circunstancia un mensaje de chat debe alterar el badge rojo de la campanita 🔔 ni listarse en su dropdown.**
2. **Bajo ninguna circunstancia se deben borrar o alterar los triggers de Postgres (`tr_notify_chat_message`) para solucionar problemas de UI.** Ese trigger es vital para los Web Push Notifications de PWA cuando la aplicación está cerrada.
3. **La UI NUNCA habla directamente con la BD**: Los componentes visuales consumen exclusivamente hooks y selectores reactivos (`useNotifications()`, `useSyncExternalStore(ChatStorage)`).

---

## 2. Mapa Arquitectónico de Flujo de Eventos

```
                                  BASE DE DATOS (POSTGRESQL)
                                               │
                      ┌────────────────────────┴────────────────────────┐
                      ▼                                                 ▼
             Tabla 'notificaciones'                              Tabla 'mensajes'
             (Alertas de negocio)                               (Chats en tiempo real)
                      │                                                 │
                      ▼                                                 ▼
          [notificationObserver.js]                             [chatRealtime.js]
          • fetchHistory(.neq('CHAT_MESSAGE'))                 • Escucha canal `msgs-${userId}`
          • Realtime postgres_changes                          • Valida sender !== currentUserId
                      │                                                 │
            ┌─────────┴─────────┐                                       ▼
    ¿Es 'CHAT_MESSAGE'?         NO                              [chatState.js]
            │                   │                               • incrementUnread(chatId)
            ▼                   ▼                               • SSOT `unreadCounts`
     [Event Bridge]   [NotificationsContext.jsx]                        │
    (turnes_notif_rcv)• Guard: if (CHAT_MESSAGE) return;                │
            │         • notifications[] (Solo sistema)                  │
            │         • unreadCount (Badge rojo)                        │
            │                   │                                       │
            │                   ▼                                       ▼
            │            🔔 NotificationsMenu                     💬 AppNavbar Chat Icon
            │            (Campanita Roja)                         (Badge Verde Esmeralda)
            ▼
     [chat/index.js]
     (Respaldo resiliente para móviles)
```

---

## 3. Catálogo de Archivos y Responsabilidades (Capas)

### Capa 1: Infraestructura & Servicios (Acceso a Datos)
- **`src/services/notificationObserver.js`**:
  - *Responsabilidad*: Singleton de conexión a Supabase Realtime para la tabla `notificaciones`.
  - *Filtro Mandatorio*: En `fetchHistory()` y `markAllAsRead()`, aplica estrictamente `.neq('tipo', 'CHAT_MESSAGE')`.
  - *Bridge*: Despacha el evento `turnes_notification_received` en `window` para consumo desacoplado.
- **`src/services/chat/chatRealtime.js`**:
  - *Responsabilidad*: Orquestador de WebSockets de Supabase para chat (`mensajes`, `postulaciones`, presencia).
  - *Invariante*: Pasa `this._userId` a `chatState.addMessageLocal()` para evitar auto-notificaciones.
- **`src/services/chat/chatNetwork.js`**:
  - *Responsabilidad*: Envío HTTP/RPC de mensajes y marcado de lectura en base de datos.
  - *Sincronización Silenciosa*: Al ejecutar `markAsRead(chatId)`, actualiza en background cualquier notificación de tipo `CHAT_MESSAGE` vinculada para limpiar servidores push.

### Capa 2: Estado de Dominio (Single Source of Truth)
- **`src/context/NotificationsContext.jsx`**:
  - *Responsabilidad*: Almacén reactivo de **Alertas del Sistema**.
  - *Guard Clauses Obligatorias*:
    ```javascript
    // En unsubInsert, unsubUpdate y unsubDelete:
    if (!row || row.tipo === 'CHAT_MESSAGE') return;
    ```
  - *Cálculo de No Leídos*: `unreadCount = notifications.filter(n => !n.leida).length`.
- **`src/services/chat/chatState.js`**:
  - *Responsabilidad*: Almacén en memoria del árbol de chats (`messages`, `conversations`, `unreadCounts`, `onlineUsers`).
  - *Lógica de Conteo*:
    ```javascript
    // Solo incrementa no leídos si el mensaje proviene de otro usuario:
    const isFromOtherUser = msg.sender && currentUserId ? msg.sender !== currentUserId : true;
    if (isFromOtherUser) this.incrementUnread(chatId);
    ```

### Capa 3: Presentación & Notificadores UI
- **`src/components/navbar/NotificationsMenu.jsx`**:
  - *Responsabilidad*: Dropdown de la campanita 🔔.
  - *Consumo*: `useNotificationsMenu()` ➔ `useNotifications()`. Cero llamadas a Supabase.
- **`src/components/layout/AppNavbar.jsx`**:
  - *Responsabilidad*: Barra de navegación principal.
  - *Consumo de Chat*: `useSyncExternalStore(ChatStorage.subscribe, ChatStorage.getSnapshot)`.
  - *Badge de Chat*: Renderiza el contador verde esmeralda basado exclusivamente en `chatSnapshot.unreadCounts`.
- **`src/components/common/GlobalNotifier.jsx`**:
  - *Responsabilidad*: Despachador de Toasts y Notificaciones Nativas del SO.
  - *Aislamiento*:
    - Listener 1: Incremento de `unreadChatsTotal` ➔ Dispara Toast de Chat.
    - Listener 2: Incremento de `unreadCount` de sistema ➔ Dispara notificación nativa/alerta de negocio.

---

## 4. Diccionario de Tipos de Notificación de Sistema

Definidos en `src/domain/notificationTranslations.js`:

| Tipo | Destinatarios | Disparador | Texto Clave |
| :--- | :--- | :--- | :--- |
| `INVITE_RECEIVED` | Candidato | Empresa envía invitación | "¡Te invitaron a un Turno!" |
| `REHIRE_OFFER_RECEIVED` | Candidato | Empresa envía oferta directa | "¡Nueva Oferta Directa!" |
| `INVITATION_ACCEPTED` | Empresa | Candidato acepta invitación | "Invitación Aceptada" |
| `MATCH_ESTABLISHED` | Ambos | Coincidencia de perfil/vacante | "Nuevo Match" |
| `JOB_APPLIED` | Empresa | Candidato se postula | "Nueva Postulación" |
| `PAYMENT_SUCCESS` | Ambos | Desbloqueo de canal tras pago | "Comisión Pagada" / "Canal Activo" |
| `CONTRACT_SIGNED` | Ambos | Acuerdo formalizado | "Acuerdo Firmado" / "¡Seleccionado!" |
| `CONTRACT_SEALED` | Ambos | Turno cerrado por ambas partes | "Proceso Completado" |
| `RATING_RECEIVED` | Ambos | Calificación mutua recibida | "Nueva Evaluación" |
| `NEW_JOB_ZONE` | Candidato | Vacante cercana publicada | "¡Nueva Vacante en tu Zona!" |

---

## 5. Directivas Estrictas para Agentes de IA

Si eres un modelo de Inteligencia Artificial (Claude, Cursor, Gemini, GPT, Antigravity) editando este proyecto:

1. 🛑 **NUNCA toques la tabla `notificaciones` para meter o sacar campos de chat**.
2. 🛑 **NUNCA elimines el filtro `.neq('tipo', 'CHAT_MESSAGE')` en `notificationObserver.js`**.
3. 🛑 **NUNCA permitas que `NotificationsContext.jsx` procese filas `CHAT_MESSAGE`**. Si necesitas manejar mensajes de chat, usa `ChatStorage` o `chatRealtime.js`.
4. 🛑 **NUNCA hagas consultas a Supabase dentro de un componente de React (`.jsx`)**. Usa los hooks existentes.
5. 🛡️ **SIEMPRE ejecuta las pruebas de regresión después de modificar estos archivos**:
   ```bash
   npx vitest run src/__tests__/chatDomainIsolation.test.js
   npm run build
   ```

---

## 6. Procedimiento de Verificación Manual (QA Checklist)

- [ ] **Caso 1: Mensaje de Chat Entrante**
  - Enviar un mensaje desde Usuario B hacia Usuario A.
  - **Verificación**: El icono de chat 💬 debe mostrar el badge verde (+1). La campanita 🔔 DEBE permanecer en 0 y su menú vacío de chats.
- [ ] **Caso 2: Mensaje de Chat Saliente (Propio)**
  - Enviar un mensaje desde Usuario A.
  - **Verificación**: El badge del chat NO debe incrementarse para Usuario A.
- [ ] **Caso 3: Notificación de Negocio (ej. Postulación)**
  - Un postulante aplica a una vacante.
  - **Verificación**: La empresa ve la campanita 🔔 con badge rojo (+1). El icono de chat 💬 no cambia.
- [ ] **Caso 4: Limpieza al Abrir el Chat**
  - Usuario A entra a `/dashboard/chat/:id`.
  - **Verificación**: El badge verde del chat se apaga instantáneamente. La campanita permanece intacta.
