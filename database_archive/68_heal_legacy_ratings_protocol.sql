-- =============================================================================
-- 68_heal_legacy_ratings_protocol.sql
-- 🚀 EVOLUCIÓN: Migración de datos legados para el Protocol State
-- 
-- Este script corrige el problema de postulaciones pendientes por calificar
-- que realmente ya fueron calificadas en la tabla `reviews`, pero que nunca
-- se les actualizó el `protocol_state` (debido a que se calificaron antes
-- de la implementación de la v3 del Double Blind Protocol).
-- =============================================================================

BEGIN;

-- 1. Curar "candidato_rated"
-- Si existe una review donde el autor es el candidato y el target es la empresa (u otro),
-- marcamos candidato_rated = true en la postulación.
WITH worker_reviews AS (
    SELECT DISTINCT shift_id, author_id
    FROM reviews
)
UPDATE postulaciones p
SET protocol_state = COALESCE(p.protocol_state, '{}'::jsonb) || jsonb_build_object('candidato_rated', true)
FROM worker_reviews r
WHERE r.shift_id = p.id AND r.author_id = p.user_id
  AND COALESCE((p.protocol_state->>'candidato_rated')::boolean, false) = false;

-- 2. Curar "empresa_rated"
-- Si existe una review donde el autor es la empresa (dueña de la vacante),
-- marcamos empresa_rated = true en la postulación.
WITH employer_reviews AS (
    SELECT DISTINCT r.shift_id, r.author_id
    FROM reviews r
)
UPDATE postulaciones p
SET protocol_state = COALESCE(p.protocol_state, '{}'::jsonb) || jsonb_build_object('empresa_rated', true)
FROM vacantes v
JOIN employer_reviews r ON r.shift_id = p.id AND r.author_id = v.empresa_id
WHERE p.vacante_id = v.id 
  AND p.id = r.shift_id
  AND COALESCE((p.protocol_state->>'empresa_rated')::boolean, false) = false;

-- 3. Desbloqueo mutuo retroactivo
-- Si ambos ya calificaron, aseguramos que ratings_unlocked = true.
UPDATE postulaciones p
SET protocol_state = p.protocol_state || jsonb_build_object('ratings_unlocked', true)
WHERE COALESCE((p.protocol_state->>'candidato_rated')::boolean, false) = true
  AND COALESCE((p.protocol_state->>'empresa_rated')::boolean, false) = true
  AND COALESCE((p.protocol_state->>'ratings_unlocked')::boolean, false) = false;

COMMIT;
