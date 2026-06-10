-- =============================================================================
-- 69_reset_all_ratings_system.sql
-- 🚀 HARD RESET: Eliminación total de calificaciones y comentarios
-- 
-- Este script:
-- 1. Vacía la tabla de reseñas (reviews).
-- 2. Restaura la calificación de TODOS los usuarios (postulantes y empresas) a 5.0.
-- 3. Limpia los flags de calificación dentro del protocolo de las postulaciones.
-- =============================================================================

BEGIN;

-- 1. Eliminar todas las reseñas físicas
TRUNCATE TABLE public.reviews RESTART IDENTITY CASCADE;

-- 2. Restaurar la reputación de todos los perfiles al valor por defecto (5.0)
UPDATE public.perfiles
SET calificacion = 5.0;

-- 3. Limpiar los metadatos de calificación en las postulaciones
-- Remueve los flags de "candidato_rated", "empresa_rated" y el "ratings_unlocked"
-- para que el sistema asuma que las postulaciones cerradas ya no esperan ni tienen calificaciones.
UPDATE public.postulaciones
SET protocol_state = protocol_state 
    - 'candidato_rated' 
    - 'empresa_rated' 
    - 'ratings_unlocked'
    - 'worker_rating_given'
    - 'worker_comment_given'
    - 'employer_rating_given'
    - 'employer_comment_given'
    - 'candidato_ignored_rating'
WHERE protocol_state IS NOT NULL;

COMMIT;
