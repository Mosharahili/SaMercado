import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { api } from "@api/client";

export function useRegisterPushToken() {
  useEffect(() => {
    void (async () => {
      if (!Constants.isDevice) {
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      try {
        await api.post(
          "/notifications/register-token",
          { token },
          {
            // backend requires auth; ignore errors if unauthenticated
            validateStatus: () => true,
          }
        );
      } catch {
        // ignore
      }
    })();
  }, []);
}

