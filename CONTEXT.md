# Historia Arquitectónica: Refactorización a Dashboard Dinámico (JobToday Style)

## El Problema Original (Sobrecarga Cognitiva)
El `DashboardPage` original sufría de un grave problema de "Cognitive Overload" en dispositivos móviles. Estaba plagado de:
- Un Header excesivamente grande con botones ruidosos redundantes ("Ver Candidatos").
- Un `CompanyDashboardSearch` masivo que acaparaba la mitad superior de la pantalla simulando ser un filtro, pero que actuaba como redireccionamiento a otras páginas, creando una navegación tipo "espagueti".
- Módulos adicionales como `TalentRadar` empujando hacia abajo las verdaderas llamadas a la acción (`SolutionsLobby`).
- Todo el excelente trabajo de métricas y urgencias procesado por el hook `useDashboard.js` (Específicamente el objeto `activeProcess`) estaba siendo extraído en el Frontend, pero **ignorado** visualmente.

## La Solución Aplicada (JobToday Action-Hub)
En lugar de aplicar un minimalismo aburrido y muerto, el usuario (Empresario/Reclutador) necesita incentivos psicológicos y visuales (CTAs, Micro-animaciones) para tomar acción inmediata. Transformamos el panel en un "Action-Hub":

### 1. El Active Process (El Latido del Dashboard)
Se revivió la variable `activeProcess`. Si existe un paso crítico pendiente (e.g. Confirmar un Contrato, Realizar un Pago), esta es la **ÚNICA** tarjeta que resalta inmediatamente debajo del Header.
- **Micro-Interacción:** Se dotó de Framer Motion para reaccionar al toque (`whileTap`, `whileHover`), y tiene un anillo de luz índigo detrás que palpita (`animate-pulse`) constantemente para atraer el ojo instintivamente.

### 2. Header Magnético
- Se eliminó el brutal botón de "Ver Candidatos" (ya que la gestión ocurre secundariamente).
- Se reemplazó por un **Giant Magnetic CTA** redondeado llamado "Talento" con borde brillante verde/esmeralda y un gradiente sutil. Da la impresión táctil de "Postular Inmediato" como en la app JobToday.
- El buscador espagueti (`CompanyDashboardSearch`) fue **borrado permanentemente** del root del proyecto.

### 3. SolutionsLobby "Bouncy" (Glassmorphism & Glow)
- Las tarjetas estáticas grises fueron reemplazadas por tarjetas oscuras premium con halos de luz colorizada debajo (naranja/azul/esmeralda) inspirados en los sellos verificados de Tinder/Uber.
- **Física de Resortes:** Al hacer hover o tap sobre las tarjetas (Impulso Urgente / Verificación Elite), saltan ligeramente hacia arriba con físicas `spring` de Framer Motion, dando un feedback visual exquisito.
- A diferencia de un simple layout, la tarjeta completa ahora es clickable, en lugar de forzar puntería sobre un botón minúsculo en móvil.

### 4. Guía de Inicio Persistente
El widget de *Onboarding* dejó de auto-esconderse cobardemente al llegar a 100%. Ahora es una barra de progreso inteligente. Si el usuario completó todo (Activó Billetera + Publicó Vacante), la tarjeta felicita amablemente y sirve de anclaje de "Ready to Launch", unificando el diseño general.

---
**Fecha del Refactor:** Marzo 2026.
**Decisión Arquitectónica Clave:** Nunca esconder alertas operativas. Nunca sobrecargar "above-the-fold" con herramientas en lugar de Acciones ("Acción sobre Herramienta").

---

# Sesión: Motor de Match, Reactividad en Exploración y Notificaciones (Marzo 24, 2026)

## Contexto General
Esta sesión se enfocó en tres módulos críticos: el motor de notificaciones por proximidad (`29_match_notification_engine.sql`), el sistema de exploración de vacantes (`ExploreVacancies`), y el algoritmo de match entre candidatos y vacantes.

---

## 1. Motor de Notificaciones Automáticas (Postgres-Native)

**Archivo:** `src/db/29_match_notification_engine.sql`

**Objetivo:** Trigger Postgres que notifica automáticamente a candidatos cercanos cuando se publica una nueva vacante.

**Bugs corregidos (en orden de aparición):**
- `column "titulo" does not exist` → El trigger usaba `NEW.cargo`; corregido a `NEW.titulo`.
- `record "new" has no field "skill_ids"` → El trigger usaba `skill_ids` de JSONB; la columna real es `etiquetas TEXT[]`. Se refactorizó la intersección de habilidades usando el operador nativo `&&` de Postgres (`NEW.etiquetas && p.skills`), eliminando 4 líneas de JSONB innecesario.

**Arquitectura del trigger:**
- Tabla: `AFTER INSERT OR UPDATE ON vacantes`
- Tipo notificación: `NEW_JOB_ZONE` (compatible con `notificationTranslations.js`)
- Metadata: `{ jobTitle, companyName }`
- Geofencing: `ST_DWithin` con `radio_km * 1000` metros
- Máximo: 500 notificaciones por vacante para no saturar la DB

---

## 2. Reactividad del Módulo de Exploración

**Archivos:** `src/hooks/useVacancyFetch.js`, `src/hooks/useExploreVacancies.js`, `src/hooks/useVacancyScoring.js`

### Bug 1 — Realtime INSERT causaba recarga destructiva
- **Causa:** El evento Supabase `INSERT` disparaba `fetch(true)` → `setLoading(true)` → React desmontaba todas las tarjetas.
- **Causa profunda:** La función `fetch()` también pasaba por el `geofencing guard` (mínimo 0.5km de movimiento). Si el usuario no se había movido, la recarga se abortaba silenciosamente. La vacante nunca aparecía.
- **Fix:** Realtime INSERT ahora llama a `VacancyService.getById(id)` (solo ese registro, con JOIN de empresas completo) y hace **prepend directo** al array de estado. Zero recargas, zero geofencing, zero flicker.

### Bug 2 — `setVacancies(normalized)` borraba tarjetas existentes
- **Causa:** Cada actualización llamaba a `setVacancies(normalized)` reemplazando el array completo.
- **Fix:** Se implementó un **smart ID-merge**: solo hace replace completo en `force=true` (acción explícita). En todos los demás casos (GPS update, focus de ventana), preserva las tarjetas existentes y hace merge incremental.

### Bug 3 — Window focus disparaba `fetch(true)` (destructivo)
- **Fix:** Cambiado a `fetch(false)` para usar el smart-merge silencioso.

### Bug 4 — Vacantes postuladas seguían apareciendo en el feed
- **Fix:** `appliedIds` inyectado en `useVacancyScoring.js`. Ahora `isNotApplied(v)` filtra instantáneamente las vacantes ya postuladas del feed y el mapa.

---

## 3. Algoritmo de Match — 5 Bugs Críticos

**Archivos:** `src/services/matchService.js`, `src/domain/vacancy.mapper.js`, `src/hooks/useVacancyScoring.js`

| # | Bug | Causa | Fix |
|---|-----|-------|-----|
| 1 | Strict match bloqueaba TODAS las vacantes | `matchScore = 0` cuando GPS es `null`; filtro `>= 40` eliminaba todo | Filtro strict activado solo cuando `userHasCoords && userHasSkills` |
| 2 | `skills` siempre vacío en el DTO | `vacancy.mapper.js` mapeaba a `v.skill_ids` (columna inexistente) | Corregido a `v.etiquetas` |
| 3 | Scoring de categoría nunca coincidía | Comparaba IDs de sector (`"GASTRONOMIA"`) vs strings de skills (`"Mesero / Camarero"`) | Añadida Strategy B: intersección fuzzy de etiquetas de la vacante vs skills del usuario |
| 4 | Vacantes cercanas rechazadas por distancia | La vista `vacantes_public` y el RPC agregan ±5km de jitter. El filtro `radius=3km` rechazaba sin buffer | Añadido `JITTER_BUFFER_KM = 6` al `matchesDistance` filter |
| 5 | Fecha de vacante mostraba `created_at` | El mapper usaba `created_at` en vez de `fecha_turno` | Corregido a `fecha_turno || created_at` |

---

## Arquitectura del Match Score (0–100 puntos)

| Dimensión | Peso | Lógica |
|-----------|------|--------|
| Distancia | 40 pts | Gradiente: <2km=40, <5km=30, <10km=20, <20km=10, <30km=4, >30km=0 pts. Omitido si GPS no disponible. |
| Categoría/Skills | 30 pts | Strategy A: match de sector ID. Strategy B: intersección fuzzy de etiquetas por texto incluido. |
| Reputación empresa | 30 pts | `isVerified` = 15 pts; `rating >= 4.5` = 15 pts |

---

## Columnas Reales de la DB (para futuras referencias)

| Tabla | Columna de Habilidades | Tipo |
|-------|------------------------|------|
| `vacantes` | `etiquetas` | `TEXT[]` |
| `perfiles` | `skills` | `TEXT[]` |

**Nota crítica:** NO existe la columna `skill_ids` en ninguna tabla del schema activo. Siempre usar `etiquetas` para vacantes y `skills` para perfiles.

---

## Vistas y RPCs clave

| Nombre | Propósito | Nota |
|--------|-----------|------|
| `vacantes_public` | Feed seguro para candidatos | Aplica ±0.09° jitter (~±5km) en lat/lng |
| `buscar_vacantes_cercanas` | PostGIS nearby search | También aplica ±0.09° jitter. LIMIT 100 |
| `rpc_create_vacancy_v3` | Creación de vacantes | Usado en `VacancyService.create()` |
| `rpc_notify_nearby_workers` | Fan-out de notificaciones | Usa índice GIST; max 500 notifs/vacante |

---
**Fecha:** Marzo 24, 2026 — Sesión de auditoría y corrección del Match Engine + Explore Reactivity.
