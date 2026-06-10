import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useUserMenu = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            // ALWAYS redirect to login and REPLACE history to prevent "back" button issues
            navigate('/login', { replace: true });
        }
    };

    const getPlanBadge = () => {
        if (!user) return { label: 'GUEST', color: 'bg-zinc-800 text-zinc-400' };
        const plan = user.planId || 'basic';
        if (plan === 'pro') return { label: 'PRO', color: 'bg-gradient-to-r from-amber-200 to-yellow-500 text-black' };
        if (plan === 'micro') return { label: 'MICRO', color: 'bg-zinc-700 text-zinc-300' };
        return { label: 'FREE', color: 'bg-zinc-800 text-zinc-400' };
    };

    return {
        user,
        logout: handleLogout,
        badge: getPlanBadge(),
        navigate // Expose navigate for menu items if needed
    };
};
