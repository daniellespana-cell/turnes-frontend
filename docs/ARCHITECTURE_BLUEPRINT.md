# 🏗️ Arquitectura de Referencia: Módulo Empresa (Turnes)

Este documento define el "Estándar Turnes" logrado en el Módulo de Empresa, sirviendo como **plano maestro** para construir el Módulo de Postulantes.

## 1. Filosofía de Diseño (DNA)
*   **Mobile-First Radical**: Todo componente se diseña primero para celular. El Navbar móvil es complejo (Search, Menu, Actions) y el Sidebar es fluido.
*   **Minimalismo Premium**: Uso de "Zinc-950" a "Black", bordes sutiles (`border-white/5`), y acentos de color semánticos (Emerald=Dinero/Éxito, Purple=Acción/Premium).
*   **Feedback Constante**: El usuario nunca adivina. Hay `Toasts`, `Skeleton Loaders`, `Empty States` ilustrados y `Micro-interacciones` (brillos, hovers).

---

## 2. Estructura Técnica (The Stack)

### A. Layout System (`src/components/layout`)
El contenedor no es solo decorativo, es funcional.
*   **`BusinessLayout.jsx`**: Gestiona el estado global de la UI (Sidebar Open/Close).
*   **`AppNavbar.jsx`**: Cerebro de navegación. En móvil muta drásticamente (Mueve el SearchBar, oculta el Logo, reorganiza íconos).
*   **`BusinessSidebar.jsx`**: Navegación lateral colapsable con lógica de "Ruta Activa" y estilos condicionales.

### B. Patrón de Datos (Clean Architecture)
Separamos estrictamente la Vista de la Lógica.
*   **Vista (`pages/business/MisVacantesPage.jsx`)**: Solo renderiza. No calcula nada.
*   **Lógica (`hooks/useVacantesLogic.js`)**: Gestiona estados, filtros y llamadas a servicios.
*   **Servicios (`services/vacantes.taxonomy.js`)**: Fuente de verdad única. Si el "Taxonomy" cambia, toda la app se actualiza (Buscador, Forms, Filtros).

---

## 3. Módulos Core (Funcionalidad)

### 🧩 1. Dashboard Inteligente (`DashboardPage.jsx`)
No es estático. Se adapta al contexto del usuario.
*   **Smart Onboarding**: Detecta si eres nuevo (Saldo 0, Sin Vacantes) y muestra `QuickStart` ("Guía de Inicio"). Se auto-destruye al completar.
*   **Priority Block**: Le dice al usuario qué hacer HOY ("Tienes 3 candidatos esperando", "Cierre de turno en progreso").
*   **Gamificación**: Muestra métricas de rendimiento y percentiles para motivar uso.

### 💰 2. Ecosistema Financiero (`WalletPage.jsx`)
El motor de monetización.
*   **Transparencia**: Muestra saldo en tiempo real (Sincronizado via `AuthContext`).
*   **Upselling Sutil**: `PremiumBanner` detecta tu plan actual. Si eres Básico, te vende Pro. Si eres Pro, desaparece.
*   **Seguridad Visual**: Iconos de candados, textos de "Protocolo Cifrado" para dar confianza.

### 📢 3. Centro de Comando (`MisVacantes` / `Chats`)
Gestión operativa masiva.
*   **Empty States**: Si no hay datos, no mostramos blanco. Mostramos ilustraciones y botones de acción ("Publicar Vacante").
*   **Buscadores Integrados**: Cada lista tiene su propio filtro en tiempo real.
*   **Taxonomía Viva**: Los filtros (Cocina, Obra, admin) vienen del `taxonomy.js`, no están hardcodeados.

### 🔔 4. Sistema de Notificaciones (`NotificationsContext`)
El sistema nervioso central.
*   **Persistencia**: Guarda qué leíste en `localStorage`.
*   **Centralización**: `useNotifications` expone todo. El menú se auto-actualiza y permite "Marcar todo como leído".
*   **Navegación Inteligente**: Al hacer clic, te lleva al contexto exacto (ej. Al chat específico o a la vacante).

---

## 4. Guía para Replicar en "Postulantes" (Next Steps)

Para llevar el módulo de candidatos al mismo nivel, debes implementar:

1.  **Dashboard de Postulante**:
    *   ¿Tiene perfil completo? (Onboarding).
    *   ¿Tiene entrevistas hoy? (Priority Block).
    *   ¿Cómo va su "Rendimiento" de aplicación? (Gamificación).

2.  **Mi Billetera (Si aplica) o "Mis Puntos"**:
    *   Mismo diseño de `WalletPage` pero adaptado a "Turnos Completados" o "Ganancias".

3.  **Mis Postulaciones**:
    *   Equivalente a `MisVacantes`. Tabla/Lista con estados: "Enviado", "Visto", "Entrevista", "Rechazado".
    *   Necesita `EmptyState` ("Aún no te has postulado").

4.  **Perfil Profesional (`ProfilePage`)**:
    *   Ya hicimos un refactor fuerte aquí, pero debe consumir la misma `taxonomy.js` para asegurar que las habilidades del candidato coincidan con las vacantes.

Este es el estándar de oro. Cualquier cosa por debajo de esto se sentirá "vieja" en comparación.
