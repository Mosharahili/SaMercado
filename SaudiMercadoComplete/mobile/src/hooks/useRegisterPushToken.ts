import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export const useRegisterPushToken = () => {
  useEffect(() => {
    (async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted') {
          await Notifications.getExpoPushTokenAsync();
        }
      } catch {
        // ignore local push setup failures in dev
      }
    })();
  }, []);
};
