import {
  Home, Briefcase, HeartHandshake,
  Megaphone, CircleDollarSign, Star, Zap,
  LayoutDashboard, Search, User, MessageCircle
} from 'lucide-react';

import { PATHS } from './routes.paths';

/**
 * 🧭 NAVIGATION CONFIGURATION
 * Defines the structure of the sidebars.
 * badgeId can be used in the future to map to a global notification state.
 */

export const BUSINESS_MENU = [
  { name: 'Panel de Control', icon: Home, path: PATHS.BUSINESS.DASHBOARD },
  // ⚡ VACANTE ACTIVA (Smart Shortcut)
  { name: 'Vacante Activa', icon: Zap, path: PATHS.BUSINESS.ACTIVE_VACANCY, badgeId: 'active-vacancy' },
  { name: 'Publicar Vacante', icon: Megaphone, path: PATHS.BUSINESS.PUBLISH },
  { name: 'Mis Vacantes', icon: Briefcase, path: PATHS.BUSINESS.VACANCIES },
  // 🤝 RED DE CONFIANZA (Calificación y Sello post-turno)
  { name: 'Red de Confianza', icon: HeartHandshake, path: PATHS.BUSINESS.CANDIDATES },
  // ⭐ MIS FAVORITOS (Bóveda de candidatos guardados)
  { name: 'Mis Favoritos', icon: Star, path: PATHS.BUSINESS.FAVORITES },
  // ⭐ MIS CALIFICACIONES (Historial recibido)
  { name: 'Mis Calificaciones', icon: Star, path: PATHS.BUSINESS.RATINGS },
  { name: 'Finanzas', icon: CircleDollarSign, path: PATHS.BUSINESS.FINANCES },
  { name: 'Mi Perfil', icon: User, path: PATHS.BUSINESS.PROFILE },
];

export const WORKER_MENU = [
  { name: 'Inicio', icon: LayoutDashboard, path: PATHS.WORKER.DASHBOARD, exact: true },
  { name: 'Explorar', icon: Search, path: PATHS.WORKER.EXPLORE },
  { name: 'Mis Postulaciones', icon: Briefcase, path: PATHS.WORKER.APPLICATIONS },
  { name: 'Mensajes', icon: MessageCircle, path: PATHS.WORKER.CHATS, badgeId: 'unread-messages' },
  { name: 'Mis Calificaciones', icon: Star, path: PATHS.WORKER.RATINGS },
  { name: 'Mis Finanzas', icon: CircleDollarSign, path: PATHS.WORKER.FINANCES },
  { name: 'Mi Perfil', icon: User, path: PATHS.WORKER.PROFILE },
];

const SHARED_BOTTOM_MENU = [
  // Defined in the Sidebar component directly to handle interactions like Logout
];
