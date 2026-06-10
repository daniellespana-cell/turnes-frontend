# DetalleVacante: Arquitectura Zero Tech-Debt (Marzo 2026)

Este documento describe las reglas estrictas de arquitectura y los flujos de datos para el módulo `DetalleVacante`, el cual fue reconstruido para eliminar vulnerabilidades, double-fetches y dependencias cíclicas (Spaghetti).

## 1. Topología del Módulo

El módulo orbita alrededor de 3 entidades principales:
*   `DetalleVacantePage.jsx` (Page): Controlador de Página.
*   `useDetalleVacante.js` (Hook): Orquestador Transaccional y Reglas de Negocio.
*   `PostulanteCard.jsx` (Component): Dumb Component puro.

---

## 2. Reglas de Inyección y Chat (DLP Firewall)

**REGLA DE ORO:** Está estrictamente **PROHIBIDO** inyectar o leer mensajes directamente desde este módulo (`supabase.from('mensajes')`). 

Cualquier intento de crear un "Rompehielos" o primer mensaje automático debe hacerse exclusivamente delegando la acción al sistema de Chat (`ChatStorage` o `useChatLogic.js`) una vez que el usuario aterrice en la URL del chat `/dashboard/chat/:id`. 
*   **¿Por qué?** Porque inyectar el mensaje desde `DetalleVacante` evade la Prevención de Fuga de Datos (DLP).

---

## 3. Prevención de Fugas de Memoria (Double-Fetch)

**REGLA DE PERFORMANCE:** Nunca vuelvas a solicitar datos al servidor si la UI ya los tiene.
*   El cálculo `rachaActiva` (ej. cuántos chats están abiertos para aplicar límites) **NO** debe disparar una segunda llamada de API dentro del hook de la acción del botón.
*   El cálculo se hace sincrónicamente en el cliente:
    `const rachaActiva = postulantes.filter(p => p.status === 'chat_abierto').length;`
    Y se pasa como parámetro hacia `ejecutarAccion(..., rachaActiva)`.

---

## 4. Flujo Transaccional de Contratación

La función encargada de inicializar la fase de Match es `ejecutarAccion` expuesta por `useDetalleVacante.js`.

**Paso a Paso Seguro:**
1.  **Validación de Completitud:** Recibe `vacanteActual` del llamante.
2.  **Límite de Pipeline:** Se bloquea si `rachaActiva >= 10` y no es un MATCH directo.
3.  **AWAIT DB Update (Crítico):** `await CandidateService.updateStatus()`. La base de datos es la única fuente de la verdad.
4.  **Navegación:** `navigate('/dashboard/chat/:id')` **SOLO** ocurre si el bloque `try` finaliza la inserción anterior, evitando dejar al usuario atorado en la pantalla mientras la BD ya cerró el trato.

---

## 5. Diseño Pure-UI (PostulanteCard)

El componente `PostulanteCard.jsx` es **Dumb (Tonto)**.
*   No importa dependencias complejas (`useDetalleVacante`, `CandidateService`).
*   No toma decisiones de negocio.
*   Su comunicación hacia afuera es exclusivamente levantando eventos al Padre vía el Callback prop `onContratar={}`.
