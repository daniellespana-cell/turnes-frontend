
import { telemetryService } from '../services/telemetryService';

export const initSentry = () => {
  telemetryService.init();
};

export const setSentryUserContext = (user) => {
  telemetryService.setUser(user);
};
