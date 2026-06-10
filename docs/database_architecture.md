# Arquitectura de Base de Datos - Turnes v2 (Supabase / PostgreSQL)

Este documento centraliza el diseño arquitectónico, los esquemas principales y las políticas de seguridad implementadas en la Base de Datos de Turnes. La infraestructura está diseñada bajo principios de **Cero Deuda Técnica**, resiliencia transaccional y seguridad militar (Defensive Security).

## 1. Entidades Principales y Estado
El ecosistema de empleabilidad se maneja mediante 3 tablas principales fuertemente acopladas y manejadas por Máquinas de Estado.
- **`perfiles`**: Contiene la información pública de Empresas y Trabajadores. Se evita la creación de tablas separadas para roles, utilizando una sola tabla con columnas dinámicas (`skills` como TEXT[], `rol` como discriminador).
- **`vacantes`**: Las ofertas laborales. Poseen un ciclo de vida estricto controlado por el Backend (Activa -> Cerrada).
- **`postulaciones`**: La tabla pivote entre perfiles y vacantes. 
  - **Manejo de Estado**: Utiliza `status` (Texto) y `step` (Entero) para el flujo de contratación (Aplicado -> Entrevista -> Pagado -> Contratado -> Finalizado).
  - **`protocol_state` (JSONB)**: Fundamental. En lugar de crear docenas de columnas booleanas (eg. `is_video_requested`, `is_employer_rated`), se usa una bolsa de datos JSONB para flexibilidad en tiempo de ejecución.

## 2. Red de Mensajería (Chat & Realtime)
El módulo de mensajería está protegido contra inyecciones, fuga de datos y denegación de servicio.
- **RLS Dinámico**: La tabla `mensajes` solo permite SELECT e INSERT si el usuario es dueño de la postulación o dueño de la vacante. Al cerrarse la vacante, las políticas de lectura pueden mutar el estado de la comunicación (Chat Lock).
- **DLP (Data Leakage Prevention)**: El trigger `check_dlp_leakage` actúa como Firewall antes del INSERT. 
  - Limpia espacios, caracteres especiales y números Leetspeak (ej: `1` por `i`, `0` por `o`).
  - Bloquea Regex de teléfonos (ej: `3[0-9]{9}`) e intentos alfanuméricos (`[0-9]{7,}`) para evitar que se salten la pasarela de pagos.
- **Rate Limiting**: Triggers de PostgreSQL evitan el SPAM limitando la cantidad de mensajes por minuto a nivel de base de datos.

## 3. Infraestructura Financiera (Wompi & Billeteras)
Para manejar dinero real, se implementó una arquitectura inmutable y asíncrona liderada por Webhooks.
- **`wompi_events` (Idempotencia)**: Cada webhook de Wompi que llega a la API se guarda en esta tabla con su `transaction_id`. Si Wompi manda un duplicado, la BD lo ignora automáticamente protegiendo contra doble acreditación.
- **`handle_wompi_webhook` (RPC)**: Función de PostgreSQL bajo `SECURITY DEFINER`. No puede ser invocada por atacantes desde el Frontend. Solo el Servidor (Service Role) la puede llamar. Procesa la recarga, crea la billetera si no existe (Auto-Provisioning) e inserta el movimiento del dinero.
- **`movimientos`**: Log inmutable de flujo de caja financiero de los usuarios.

## 4. Red de Confianza (Sistema Doble Ciego)
El sistema anti-represalias de Turnes.
- **`reviews`**: Tabla que almacena calificaciones (1 a 5 estrellas) y comentarios. 
- **Desbloqueo Mutuo**: Los RPCs (`rpc_rate_and_seal_v3` y `rpc_rate_employer`) insertan las evaluaciones de forma oculta y solo actualizan la vista pública (`perfiles.calificacion`) cuando ambas partes han votado, validando la lógica en `postulaciones.protocol_state`.

## 5. Auditoría Legal (Audit Logs)
- **`audit_logs`**: Tabla apéndice-solo (Append-Only) asegurada con Constraint Checks (`length(action) > 0`). Usada para registrar aceptaciones de TyC y cobros de comisiones inevadibles. Las RLS prohíben el UPDATE y el DELETE para siempre.

---
### Resumen del Ecosistema de Funciones Supabase (RPCs)
Toda regla de negocio compleja **NO debe operar en el Frontend**. React simplemente invoca RPCs, delegando a Postgres la responsabilidad de las transacciones (ACID):
- `rpc_confirm_agreement`: Efecto *Winner-Takes-All*. Contrata a un candidato, rechaza atómicamente a los demás y cierra la vacante permanentemente.
- `rpc_rate_and_seal_v3`: Califica silenciosamente y sella el chat.
- `handle_wompi_webhook`: Core contable para dispersión/recarga.
