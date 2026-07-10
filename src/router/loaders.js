import { supabase } from '../services/supabaseClient';
import { redirect } from 'react-router-dom';
import { getSessionCache, setSessionCache, clearSessionCache } from '../utils/sessionCache';

// Re-export so AuthContext can clear the cache on logout without importing from router

// --------------------------------------------------------------------------
// safeGetSession
// Tries to get the session, first from the in-memory cache (populated by
// AuthContext's onAuthStateChange listener), then from Supabase with a
// timeout. In Firefox, supabase.auth.getSession() may hang — the cache hit
// path avoids it entirely once the auth event has fired.
// --------------------------------------------------------------------------
const safeGetSession = async (timeoutMs = 2000) => {
  const cache = getSessionCache();
  if (cache.fetched) {
    return { data: { session: cache.data } };
  }

  const result = await Promise.race([
    supabase.auth.getSession(),
    new Promise(resolve =>
      setTimeout(() => resolve({ data: { session: null }, error: 'timeout' }), timeoutMs)
    ),
  ]);

  if (result?.data?.session) {
    setSessionCache(result.data.session);
  }

  return result;
};

// --------------------------------------------------------------------------
// ROOT LOADER  (runs on every navigation under "/")
// Lightweight — only checks session status for routing decisions.
// Full user profile is loaded by AuthContext's onAuthStateChange listener.
// --------------------------------------------------------------------------
export const rootLoader = async () => {
  try {
    const { data: { session }, error } = await safeGetSession(2000);
    if (error === 'timeout') {
      // Firefox: getSession() hung. AuthContext's onAuthStateChange will handle it.
      return { user: null, timedOut: true };
    }
    return { user: session?.user ?? null, timedOut: false };
  } catch {
    return { user: null, timedOut: false };
  }
};

// --------------------------------------------------------------------------
// PROTECTED LOADER  (not currently wired into the router, kept for future use)
// --------------------------------------------------------------------------
const protectedLoader = async ({ request }) => {
  const { data: { session } } = await safeGetSession(500);
  const cache = getSessionCache();
  if (!session && cache.fetched) {
    const url    = new URL(request.url);
    const params = new URLSearchParams();
    params.set('from', url.pathname);
    return redirect(`/login?${params.toString()}`);
  }
  return null;
};

// --------------------------------------------------------------------------
// PUBLIC-ONLY LOADER  (login / register pages)
// Redirects authenticated users to the dashboard.
// Cache-first so it never blocks on a slow getSession() call.
// --------------------------------------------------------------------------
export const publicOnlyLoader = async () => {
  const cache = getSessionCache();

  // Fast path: we already know there is (or isn't) a session
  if (cache.fetched) {
    if (cache.data) return redirect('/dashboard');
    return null;
  }

  // Slow path: first visit before auth event has fired
  const { data: { session } } = await safeGetSession(500);
  if (session) return redirect('/dashboard');
  return null;
};
