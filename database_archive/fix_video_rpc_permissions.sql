-- fix_video_rpc_permissions.sql
-- Grant EXECUTE permissions for the new Video Validation DB rules to the authenticated role.

BEGIN;

GRANT EXECUTE ON FUNCTION public.rpc_request_video_validation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_video_stats(uuid) TO authenticated;

COMMIT;
