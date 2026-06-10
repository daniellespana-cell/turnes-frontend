# Sistema de Calificación y Red de Confianza (Double-Blind Rating System)

Este documento detalla la arquitectura, el flujo y las reglas de negocio del sistema de **Red de Confianza** implementado en Turnes, diseñado específicamente para prevenir represalias (venganzas) y garantizar calificaciones honestas entre Postulantes y Empresas.

## 1. El Problema (Por qué Doble Ciego)
En los sistemas de calificación tradicionales, si la Parte A recibe un servicio y califica inmediatamente con "1 estrella" a la Parte B, el promedio de B disminuye al instante. Cuando la Parte B entra a calificar a A, ve que su nota bajó y, por represalia, le pone "1 estrella" a A, independientemente del desempeño real.
Para evitar esto, Turnes implementa un modelo **Double-Blind (Doble Ciego)** al estilo de las grandes plataformas (Airbnb, Uber).

## 2. La Solución Arquitectónica
El ciclo de vida del turno cuenta con dos actores: **El Empleador (Empresa)** y **El Trabajador (Candidato/Postulante)**.

### a. Estados de Postulación
- `step = 0` -> Aplicado (Pendiente)
- `step = 3` -> Acuerdo Confirmado (Chat habilitado)
- `step = 4` y `status = 'finalizado'` -> Ciclo cerrado, en fase de calificación. En este punto la conversación del chat se sella permanentemente.

### b. Capa de Base de Datos (Transaccional)
Las calificaciones NO se inyectan crudas desde el Frontend a la tabla `reviews`. En su defecto, se utilizan dos RPCs Atómicos en PostgreSQL:
1. **`rpc_rate_and_seal_v3`**: Usado por el **Empleador** para dar por finalizado el turno y emitir su calificación.
2. **`rpc_rate_employer`**: Usado por el **Candidato** para emitir su calificación hacia la empresa.

### c. El Gatillo del Desbloqueo (Protocol State)
Ambos procedimientos interactúan con la columna JSONB `protocol_state` de la tabla `postulaciones`.
- Cuando el Actor A vota (por ejemplo, la empresa), el sistema inserta su review pero **NO actualiza los promedios globales** (perfiles.calificacion). Simplemente anota `"empresa_rated": true`.
- Cuando el Actor B vota (ejemplo, el candidato), el sistema detecta que la otra parte ya votó. Entonces, en ese mismo microsegundo transaccional:
  - Inserta la reseña de B.
  - Calcula el promedio histórico total para la Empresa y actualiza `perfiles.calificacion`.
  - Calcula el promedio histórico total para el Candidato y actualiza `perfiles.calificacion`.
  - Anota `"ratings_unlocked": true`.

---

## 3. Flujo Frontend

### A. Lado Empresa (`MisCandidatosPage.jsx`)
1. Al pulsar "Finalizar y Calificar" en el Chat, la UX lleva a la Empresa a "Mis Candidatos -> Pendientes".
2. Ahí, la tarjeta del postulante (`CandidatoCard.jsx`) exige marcar 1-5 estrellas y si hubo asistencia.
3. Se invoca `useCandidatosLogic.js -> sellarTurno` -> `CandidateService.rateAndSealCandidate`.
4. Visualmente, el candidato pasa de "Pendientes" al "Historial" (Red de Confianza).

### B. Lado Candidato (`WorkerApplications.jsx`)
1. El candidato revisa su listado de turnos finalizados.
2. La base de datos, mediante `protocol_state`, indica que el candidato **NO ha calificado aún**.
3. El frontend  muestra un botón brillante "Calificar Empresa" (`ShiftCardActions.jsx`).
4. Al hacer clic, se abre `RateEmployerModal.jsx` exigiendo 1-5 estrellas.
5. Se invoca `CandidateService.rateEmployer`. El modal se cierra, y si ambas partes cumplieron, los perfiles públicos se actualizan mundialmente.

## 4. Auditoría y Seguridad
- **Permisos Estrictos**: Los RPCs actúan bajo `SECURITY DEFINER` y validan minuciosamente que el usuario que ejecuta la función sea el dueño de la vacante o el postulante firmado, impidiendo inyecciones.
- **Evitar Duplicidad**: Los RPCs verifican el `protocol_state`. Si `empresa_rated = true`, cualquier intento adicional arroja un `RAISE EXCEPTION`.
- **Atomicidad**: Si falla el recálculo (por ejemplo, la BD se queda sin memoria en medio de la suma matemática), el guardado de la calificación "hace rollback", evitando que el estado quede corrupto (no se marca como votado si no guardó la estrella).

## 5. Cierre de Brecha de DLP
Al sellarse (`status = 'finalizado'`), las Políticas de Seguridad Nivel Fila (RLS) en los chats dictaminan que la sala se congela en estatus `isClosed = true`, ocultando inputs y previniendo que cualquiera de los dos lados agreda textualmente a la otra persona si hubo una mala calificación posterior.
