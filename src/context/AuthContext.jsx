import React from 'react';

import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { profileMapper } from '../utils/profileMapper';
import { clearSessionCache, setSessionCache } from '../utils/sessionCache';
import { logger } from '../utils/logger';
import { setSentryUserContext } from '../config/sentry.config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  
  // 🛡️ HYDRATION CONTROL: Singleton ref inside React tree (Zero Global State)
  const activeProfilePromise = useRef(null);

  // Background Hydration
  const loadUserProfile = useCallback(async (session) => {
    if (!session?.user) return null;

    // STEP 1: Optimistic JWT Shell (Instant)
    const shell = profileMapper.normalize(null, session.user);
    setUser(prev => prev?.is_hydrated ? prev : shell);

    // STEP 2: Background Fetch (Concurrency safe)
    if (activeProfilePromise.current) return await activeProfilePromise.current;

    activeProfilePromise.current = (async () => {
      try {
        const bootData = await authService.getProfile(session.user.id);
        const profile = bootData?.profile;
        if (profile) {
          const fullUser = profileMapper.normalize(profile, session.user);
          fullUser.saldo = bootData.wallet?.saldo || 0;
          setUser(fullUser);
          setSentryUserContext(fullUser);
          return fullUser;
        }
      } catch (err) {
        console.warn("Hydration failed, using JWT shell.", err);
      } finally {
        activeProfilePromise.current = null;
      }
      return shell;
    })();

    return await activeProfilePromise.current;
  }, []);

  // UI Support Actions
  const actualizarSaldo = useCallback((nuevoSaldo) => {
    setUser(prev => prev ? { ...prev, saldo: nuevoSaldo } : null);
  }, []);

  const actualizarPerfil = useCallback(async (nuevosDatos) => {
    // 🔄 Mapeo Delegado (Senior SSOT)
    const dbPayload = profileMapper.mapUIToDB(nuevosDatos);

    // 🔥 Parche de Estado Inmediato (Optimista)
    setUser(prev => {
      if (!prev) return null;
      return profileMapper.normalize({ ...prev, ...dbPayload }, null);
    });

    if (user?.id) {
      await authService.updateProfile(user.id, nuevosDatos);
    }
  }, [user]);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session) return await loadUserProfile(data.session);
    return null;
  }, [loadUserProfile]);

  // 🔥 REAL-TIME SYNC: Profiles & Wallet
  // eslint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session) {
        setSessionCache(session);
        loadUserProfile(session);
      } else {
        clearSessionCache();
        setUser(null);
        setSentryUserContext(null);
      }

      if (!authReady) setAuthReady(true);
    });

    let profileSubscription = null;
    let walletSubscription = null;

    if (user?.id) {
      // 1. Sync Perfil
      profileSubscription = supabase
        .channel(`profile-updates-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'perfiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          setUser(prev => prev ? profileMapper.normalize({ ...prev, ...payload.new }, null) : null);
        })
        .subscribe();

      // 2. Sync Billetera (Reactividad Financiera)
      walletSubscription = supabase
        .channel(`wallet-updates-${user.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'billeteras',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          logger.info("💰 [AuthContext] Balance Update:", payload.new.saldo);
          actualizarSaldo(payload.new.saldo);
        })
        .subscribe();
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      profileSubscription?.unsubscribe();
      walletSubscription?.unsubscribe();
    };
  }, [loadUserProfile, authReady, user?.id, actualizarSaldo]);

  // Providers Events (Wallet etc)
  useEffect(() => {
    const onWalletUpdate = (e) => {
      if (e.detail && typeof e.detail.balance !== 'undefined') {
        actualizarSaldo(e.detail.balance);
      }
    };
    window.addEventListener('turnes_wallet_update', onWalletUpdate);
    return () => window.removeEventListener('turnes_wallet_update', onWalletUpdate);
  }, [actualizarSaldo]);

  // 🔥 SENIOR FIX: Wrappers Seguros para Login/Logout
  const handleLogin = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.error) throw response.error;

    // Forzamos la hidratación ANTES de liberar la promesa al componente UI
    if (response.data?.session) {
      setSessionCache(response.data.session);
      await loadUserProfile(response.data.session);
    }
    return response;
  };

  const handleLogout = useCallback(() => {
    setUser(null);
    clearSessionCache();
    localStorage.removeItem('sb-turnes-auth-token');
    authService.logout().catch(err => console.error("Error silencioso en logout:", err));
  }, []);

  const value = useMemo(() => ({
    user,
    setUser,
    isAuthenticated: !!user,
    loading: !authReady,
    login: handleLogin,
    loginWithGoogle: (role, isLogin) => authService.loginWithGoogle(role, isLogin),
    logout: handleLogout,
    actualizarSaldo,
    actualizarPerfil,
    refreshSession,
  }), [user, authReady, actualizarSaldo, actualizarPerfil, refreshSession, handleLogout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};