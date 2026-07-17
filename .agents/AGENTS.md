# Turnes AI/Dev Architecture Rules
> Este archivo define las reglas arquitectónicas estrictas del proyecto Turnes. CUALQUIER Agente de IA o desarrollador que modifique el código debe leer y obedecer estas directrices para prevenir deuda técnica y regresiones en la base de código.

## 1. Single Source of Truth (SSOT) en Base de Datos
- **Prohibición Estricta:** La interfaz de usuario (Componentes React) y la Capa de Dominio (`src/domain/`) **JAMÁS** deben importar a `supabase` ni ejecutar llamadas directas como `supabase.from()`.
- **Enrutamiento Obligatorio:** Cualquier mutación o consulta a la base de datos debe estar envuelta y expuesta exclusivamente a través de la Capa de Servicios (`src/services/`) usando `BaseService.handle()`.
- **Gestión de Errores:** Nunca asumas que la consulta a la BD es exitosa. Todo servicio debe manejar bloqueos, caídas de red y retornar siempre el objeto `{ data, error }`.

## 2. Paginación y Prevención de OOM (Out Of Memory)
- **Consultas Financieras/Masivas:** Cualquier proceso en el frontend que necesite leer tablas enteras (ej. `adminService.getGlobalFinancialKPIs`) debe paginarse explícitamente mediante ciclos `while` que iteren sobre `supabase.range(from, to)` en bloques manejables (ej. 5,000 registros). **Prohibido el uso de `.limit(x)` como parche.**
- **Infinite Scroll de Mapas y Feeds:**
  - Se debe utilizar **Paginación Basada en Cursores Espaciales**, nunca Offset/Limit, para evitar duplicados en inserciones concurrentes.
  - El Backend (PostGIS RPC) requiere parámetros explícitos: `limit`, cursor principal (`last_distance` como entero para evadir Floating Point Drift) y cursor de desempate (`last_id` UUID).
  - El Frontend (`useVacancyFetch`) debe extraer y almacenar la memoria de estos cursores a partir de la última tarjeta renderizada, e inyectarlos en `loadMore()`.
  - **Deduplicación React:** Antes de actualizar el estado, se debe filtrar cualquier nuevo arreglo usando un `Set(prev.map(v => v.id))` para descartar duplicados en la capa del cliente.

## 3. PostGIS y Rendimiento en RPCs
- Las funciones `SECURITY DEFINER` deben estar siempre blindadas con `SET search_path = public, extensions` para prevenir secuestro de esquemas y retener acceso a los tipos geográficos.
- Todo cálculo trigonométrico pesado (ej. `ST_Distance`) en consultas masivas debe estar aislado en un CTE (`WITH`) para que el planificador de consultas de PostgreSQL lo ejecute una única vez.
- Para evitar problemas de precisión en Javascript (IEEE 754), cualquier métrica de distancia usada como cursor debe exportarse desde SQL casteada a Entero: `ROUND(ST_Distance(...))::INTEGER`.

## 4. Impacto Funcional Cruzado
- Antes de modificar el comportamiento por defecto de métodos globales (ej. `GeoService.fetchNearby`), evalúa el impacto cruzado (ej. Dashboard, Buscador Interno). Si un algoritmo depende de la amplitud del resultado (ej. `MatchService`), se deben inyectar límites rígidos locales (`limit = 100`) para no amputar su efectividad si el nuevo límite global es menor.

## 5. Arquitectura de Estado y React UI (Enterprise Grade)
- **Gestión de Estado de Servidor:** Queda **ESTRICTAMENTE PROHIBIDO** usar `useState`, `useEffect` e `IntersectionObserver` manuales para manejar paginación, cursores, deduplicación y banderas de carga (loading, isFetching). Toda petición al servidor y su paginación debe gestionarse a través de **`@tanstack/react-query`** (`useInfiniteQuery`, `useQuery`).
- **Virtualización del DOM:** Cualquier lista larga (Buscador de Vacantes, Explorador de Talento, Historial de Chat) debe estar envuelta en **`@tanstack/react-virtual`** (`useWindowVirtualizer`). Si se renderizan cientos de componentes complejos simultáneamente, la memoria de los dispositivos de gama baja colapsará (OOM).

## 6. Privacidad y Seguridad (Privacy Shield)
- **Zero-Trust de Coordenadas:** Las coordenadas geográficas exactas de Candidatos NO deben ser expuestas al frontend de las Empresas, y viceversa, para evitar perfilamiento y doxxeo.
- **Fuzzing Determinístico:** Cualquier RPC de búsqueda geográfica que retorne `lat` y `lng` (ej. `buscar_talento_cercano`) debe aplicar un Jitter Determinístico (ej. `lat + (hashtext... % 100) * 0.02`). El desvío debe basarse en un hash estático (como la misma coordenada) para que el pin en el mapa se mueva ~2km, pero siempre aparezca en el mismo lugar, permitiendo aprovechar las cachés de red y de React.
