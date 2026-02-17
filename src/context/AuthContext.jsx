import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

// CONFIGURACIÓN DE PLANES (Mantenemos la lógica de negocio frontend)
const PLANS_CONFIG = {
  'Básico': { name: 'Básico', price: 0, commission: 0.06, fixedJobCost: 19900, includedFixed: 0, features: ['Publicaciones ilimitadas', 'Soporte estándar'] },
  'Micro': { name: 'Micro', price: 29900, commission: 0.04, fixedJobCost: 0, includedFixed: 7, features: ['Comisión reducida (4%)', '7 Vacantes fijas gratis'] },
  'Pro': { name: 'Pro', price: 79900, commission: 0, fixedJobCost: 0, includedFixed: null, features: ['Sin comisiones (0%)', 'Vacantes fijas ilimitadas'] }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // NORMALIZADOR DE DATOS (Adapta DB -> UI)
  const normalizeUser = useCallback((profileData) => {
    if (!profileData) return null;

    const role = profileData.rol || 'postulante';
    const planKey = 'Básico'; // Por defecto todos empiezan en Básico
    const planData = PLANS_CONFIG[planKey];

    return {
      ...profileData, // id, email, nombre_display, avatar_url
      role,
      // Si es empresa, mezclamos datos del plan
      ...(role === 'empresa' && {
        plan: planData.name,
        commission: planData.commission,
        fixedJobCost: planData.fixedJobCost,
        planFeatures: planData.features,
        saldo: 0, // El saldo real vendrá de FinanceService, aquí iniciamos en 0 para UI safe
      })
    };
  }, []);

  // 1. ESCUCHA DE SESIÓN REAL (SUPABASE)
  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Si hay sesión, traemos el perfil rico de la DB
          const profile = await authService.getProfile(session.user.id);
          if (mounted && profile) {
            // Mezclamos auth.users (email) + public.perfiles (datos)
            setUser(normalizeUser({ ...profile, email: session.user.email }));
          }
        }
      } catch (error) {
        console.error("Session Check Failed", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getSession();

    // Listener de cambios (Login/Logout en otras pestañas o ventanas)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        if (profile) setUser(normalizeUser({ ...profile, email: session.user.email }));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [normalizeUser]);

  // WRAPPERS PARA UI (Mantienen compatibilidad con componentes viejos)
  const login = async (email, password) => {
    await authService.login(email, password);
    // El listener de 'onAuthStateChange' actualizará el estado automáticamente
  };

  const loginWithGoogle = async () => {
    await authService.loginWithGoogle();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // ACTUALIZACIÓN DE SALDO (Solo UI state locales, la DB la maneja FinanceService)
  const actualizarSaldo = useCallback((nuevoSaldo) => {
    setUser(prev => prev ? { ...prev, saldo: nuevoSaldo } : null);
  }, []);

  // ACTUALIZACIÓN PERFIL (UI State)
  const actualizarPerfil = useCallback((nuevosDatos) => {
    setUser(prev => prev ? { ...prev, ...nuevosDatos } : null);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    loginWithGoogle,
    logout,
    loading,
    actualizarSaldo,
    actualizarPerfil,
    isAuthenticated: !!user
  }), [user, loading, login, loginWithGoogle, logout, actualizarSaldo, actualizarPerfil]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};