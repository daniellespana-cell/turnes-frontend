# 🧠 TURNES: Auditoría Integral de Proyecto & Plan Estratégico
**Fecha:** 11 de Febrero, 2026
**Rol:** CTO & Consultor de Negocios Senior
**Estado:** Alpha / Pre-Lanzamiento

---

## 1. Modelo de Negocio: "La Uberización del Talento"
El modelo de Turnes se aleja de las agencias tradicionales (Headhunting lento) y de los portales de empleo pasivos (LinkedIn). Se posiciona como una **Plataforma de Desbloqueo de Talento en Tiempo Real**, similar a la lógica operativa de InDriver o Airbnb, pero aplicada a recursos humanos operativos.

### 🧠 Lógica Core: "Delegación & Desbloqueo"
1.  **Pago Delegado (Cash-First):** Turnes **NO procesa la nómina** ni los pagos diarios de los turnos. El "Jefe" paga directamente al trabajador (efectivo/transferencia) al finalizar el turno. Esto elimina la carga administrativa y financiera de la plataforma.
2.  **Monetización por "Match":** Turnes cobra únicamente por la conexión exitosa. El negocio paga por el derecho a acceder al contacto y confirmar el turno con un trabajador calificado.

### 📊 Estructura de Planes & Costos

| Plan | Costo Mensual | Comisión Variable | Costo Fijo (Adicional) | Beneficios Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Básico** | $0 / mes | 6% por turno | $19,900 por contratación | Acceso estándar, pago por uso. Ideal para PyMEs eventuales. |
| **Micro** | $29,900 / mes | 4% por turno | $0 (7 primeros gratis) | 7 Vacantes fijas incl. Comisión reducida. Para negocios pequeños constantes. |
| **Pro** | $79,900 / mes | 0% (Sin comisión) | $0 (Ilimitados) | "All You Can Eat". Para cadenas y alta rotación. Insignia de "Verificado". |

> **Nota Estratégica:** El costo de $19,900 por contratación fija es disruptivo comparado con el 10-20% del salario anual que cobran las agencias tradicionales.

---

## 2. Estado Técnico y de Infraestructura
Actualmente, el proyecto opera bajo una arquitectura **Serverless / Composable Web**, priorizando velocidad de desarrollo y escalabilidad bajo demanda.

### 🏗️ Stack Tecnológico
*   **Frontend (Cliente):** Vite + React 19. Arquitectura SPA (Single Page Application) altamente reactiva.
*   **UI Kit:** Tailwind CSS v4 (Utility-first) + Framer Motion (Animaciones "Premium").
*   **Maps:** Leaflet (OpenSource) para geolocalización de vacantes.
*   **Backend & Base de Datos:** Supabase (PostgreSQL).
    *   *Nota:* Aunque se menciona "Google Cloud/Firebase" en visión, la implementación actual es **100% Supabase** para Auth, DB y Realtime. Esto es una ventaja técnica (Relacional vs NoSQL de Firebase).
*   **Autenticación:** Supabase Auth (Integrado con Google OAuth).
    *   Manejo de roles robusto (`public.perfiles` con roles 'empresa' / 'postulante').
    *   Sistema de "KYC Ligero" (Validación de identidad en proceso).

### 🚦 Semáforo Técnico (Post-Deep Dive)

*   🟢 **Frontend Auth:** Completado y Pulido.
*   🟢 **Worker Portal:** Completo. Dashboard, Billetera y 'Mis Turnos' detectados en `src/pages/worker`.
*   🟢 **Chat & Pagos:** ¡Implementado!
    *   Lógica de "Chat Compartido" (`ChatPage.jsx`) adapta la vista según rol.
    *   **Pago de Comisión:** Detectada lógica `ejecutarPagoComision` que debita de la billetera interna (`financeService.js`). No es una pasarela externa directa, sino un Wallet Debit.
*   🟡 **Gestión de Vacantes (Híbrido):**
    *   *Diagnóstico:* "Lógica Dispersa pero Funcional".
    *   *Escritura:* `useCreateVacante.js` usa `VacancyService` para guardar en Supabase (✅ Correcto).
    *   *Lectura (Dashboard Empresa):* `useVacantesLogic.js` mezcla datos de localStorage + Mock Data. No lee de Supabase aún. Esto explica por qué las vacantes creadas a veces no aparecen o se borran al limpiar caché.
    *   *Lectura (Explorar):* `useExploreVacancies.js` sí lee de Supabase, pero filtra en el cliente.
    *   *Conclusión:* El sistema funciona "a dos manos": una mano escribe en la nube, la otra lee del bolsillo local.
*   🔴 **Motor de Matching:** Implementado en Cliente (`matchService.js`) pero sin persistencia.

### 🔍 Auditoría de Capa de Servicios (`src/services`)
He revisado archivo por archivo para garantizar la integridad:

*   **`authService.js` (Excelente):**
    *   Usa `supabase.auth` nativo + `public.perfiles`.
    *   Maneja metadata compleja en el registro (Trigger de DB).
*   **`geoService.js` (Funcional / Cliente):**
    *   Cálculo Haversine en el frontend.
    *   *Limitación:* Filtra en memoria del navegador, no en base de datos. Escalará mal con >1000 vacantes.
*   **`matchService.js` (Lógica de Negocio):**
    *   Algoritmo de Scoring implementado: Distancia (40%) + Categoría (30%) + Reputación (30%).
    *   *Estado:* Frontend-heavy. Funciona correctamente para la escala actual (Alpha), pero debería migrarse a una Supabase Edge Function en Fase 2 para escalar masivamente.
*   **`turnesSync.js` (✅ FIXED - Integrado a Nube):**
    *   *Diagnóstico Anterior:* Usaba localStorage (Simulación).
    *   *Solución:* Se ha refactorizado para usar `VacancyService.close()`.
    *   *Resultado:* Cierra el ciclo de negocio directamente en el Backend, manteniendo la "magia" de la sincronización en tiempo real.
*   **`reputationService.js` & `contactService.js`:**
    *   Conectados correctamente a tablas Supabase (`reviews`,## 4. Current Status (Updated: 2026-02-13) 🟢

### ✅ Completed Milestones
1.  **Identity & Auth Core:**
    *   **Supabase Auth v2:** Strict triggers `handle_new_user` now auto-create `Profile` + `Wallet` + `Company` (if applicable).
    *   **RBAC & Protection:** `ProtectedRoute` enforces `allowedRoles` (Postulante vs Empresa).
    *   **Profile Gate:** Anti-ghost system redirects incomplete profiles to `/dashboard/perfil`.
    *   **Password Reset:** Full flow implemented (Forgot -> Email -> Reset -> Login).

2.  **Database Hardening (The Fortress):**
    *   **Schema Validation:** All tables audited (PKs, FKs, Indexes).
    *   **Stress Test Passed:** Executed `100_STRESS_TEST_DOOMSDAY` (50k+ records) validating RLS and Indexes.
    *   **Schema Drifts Fixed:**
        *   `postulaciones.user_id` now correctly correctly references `public.perfiles` (FK Fix).
        *   `vacantes.tipo_turno` added.
        *   `perfiles.calificacion` added (0.0 - 5.0).

3.  **Chat & Pipeline Logic:**
    *   **Centralized Workflow:** `useChatProtocol` manages state (Payment -> Video -> Agreement).
    *   **DLP Engine:** Regex-based Data Leakage Prevention active in `useChatSecurity`.
    *   **Candidate Dashboard:** Connects to real data with correct Schema (Service Layer).

4.  **UI/UX:**
    *   **"Neon Dark" Theme:** Unified premium aesthetic across Auth and Dashboards.
    *   **Performance:** Code splitting and lazy loading enforced.

### 🚧 In Progress
*   **Wompi Integration:** Connecting the `Wallet` to real money.

---

## 5. Architecture & Tech Stack

### Frontend (Vite + React)
*   **Routing:** `react-router-dom` with RBAC Guards.
*   **State:** Context API (`AuthContext`, `NotificationsContext`) + Local Hooks.
*   **Design:** Custom Tailwind CSS (No component libraries, pure CSS).

### Backend (Supabase)
*   **Auth:** Native Supabase Auth + Trigger-based User Provisioning.
*   **Database:** PostgreSQL 15+ with Row Level Security (RLS).
*   **Logic:** PL/pgSQL Functions (RPCs) for atomic operations (e.g., `rpc_process_protocol_step1`).
*   **Storage:** Supabase Storage for Avatars and Contracts.

### Key Database Schemas (Critical)

| Table | Critical Columns | Notes |
| :--- | :--- | :--- |
| `auth.users` | `id`, `email`, `meta_data` | Managed by Supabase. Triggers downstream creation. |
| `public.perfiles` | `id` (FK), `rol`, `calificacion` | Public profile data. `calificacion` added for Reputation. |
| `public.vacantes` | `id`, `titulo`, `tipo_turno`, `lat/lng` | Core offering. `tipo_turno` added for taxonomy. |
| `public.postulaciones`| `id`, `user_id`, `step`, `is_paid` | The "Match". `user_id` links to `perfiles` (not auth). |
| `public.billeteras` | `id`, `saldo` | Financial core. Strictly controlled via RPCs. |

---

## 6. Development Guidelines
*   **Schema First:** If the Frontend needs data, CHECK the DB first. Do not invent columns (`title` vs `titulo`).
*   **Security First:** Never insert into `public.users`. Insert into `auth.users` and let Triggers work.
*   **No Ghosts:** Users must have Names and Avatars to interact.
    *   El Jefe puede invitar a Video Llamada dentro del chat (`useChatWorkflow.js`).
3.  **El Desbloqueo (Payment):**
    *   Jefe pulsa "Contratar" en el chat.
    *   Sistema debita comisión de su Billetera (`financeService`).
    *   **"Bóveda Abierta":** Se revelan datos y se desbloquea el video indefinido.
4.  **Ejecución:** Trabajador asiste.
5.  **Pago Final:** Jefe paga en efectivo al terminar.

---

## 5. Análisis de 'Gaps' y Riesgos

### ⚠️ Riesgos de Fuga
*   El filtro "Área 51" es robusto, pero Jefes astutos pueden intentar escribir números en letras ("trescientos...").
    *   *Nota:* El código actual ya tiene RegEx para `tres uno dos`, ¡bien jugado!

### ⚠️ Brechas Técnicas Actualizadas
*   **Recarga de Billetera:** Existe la lógica de débito, pero falta la pantalla de "Recarga con Wompi" para meter dinero real al sistema.
*   **Notificaciones Push:** Aún pendiente.

---

## 6. Próximos Pasos Técnicos (Roadmap Ajustado)

1.  **Pasarela de Recargas:**
    *   La lógica de pagar comisión existe, pero el jefe necesita saldo.
    *   *Prioridad:* Integrar Wompi para "Recargar Billetera".
2.  **Refactor de Servicios:**
    *   Mantener el plan de centralizar `VacancyService`, pero respetando la lógica de chat existente que es muy avanzada.
3.  **Matching:**
    *   Implementar el algoritmo de scoring.

---
**Conclusión del Auditor:** Turnes tiene una base sólida y un modelo de negocio claro que ataca un dolor real (la lentitud y costo de agencias). El reto actual es pasar de una "Web Bonita" a una "Plataforma Transaccional" integrando pagos y geolocalización real.
