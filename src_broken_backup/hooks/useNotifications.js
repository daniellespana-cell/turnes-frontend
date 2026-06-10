// CONSUMER HOOK
// Now simply exposes the context values.
// The logic moved to src/context/NotificationsContext.jsx
import { useNotificationsContext } from '../context/NotificationsContext';

export const useNotifications = () => {
    return useNotificationsContext();
};
