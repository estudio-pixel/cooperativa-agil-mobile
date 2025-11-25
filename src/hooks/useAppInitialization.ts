import { useEffect } from 'react';
import { authenticateAnonymously } from '../services/authService';
import { 
  requestNotificationPermission,
  getFCMToken,
  setupNotificationHandlers,
  subscribeToLocationTopic
} from '../services/notificationService';
import {
  getCurrentLocationWithPermission,
  sendLocationToBackend
} from '../services/locationService';

export const useAppInitialization = (displayNotification: (remoteMessage: any) => void) => {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const notificationPermissionGranted = await requestNotificationPermission();

        if (!notificationPermissionGranted) {
          console.log('Permissão de notificação negada, continuando sem notificações');
        }

        await getFCMToken();

      setupNotificationHandlers(displayNotification);
      
      const authToken = await authenticateAnonymously();
      
        try {
          const { latitude, longitude } = await getCurrentLocationWithPermission();
          const addressComponents = await sendLocationToBackend(latitude, longitude, authToken);

          if (addressComponents) {
            const city = addressComponents.administrative_area_level_2;
            const state = addressComponents.administrative_area_level_1;
            const country = addressComponents.country;

            if (city) {
              console.log('Localização detectada:', { city, state, country });
              await subscribeToLocationTopic(city, state, country);
            } else {
              console.warn('Cidade não encontrada na resposta do backend');
            }
          }
        } catch (locationError) {
          console.error('Erro ao processar localização:', locationError);
        }
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
        return undefined;
      }
    };

    initializeApp();
  }, []);
};
