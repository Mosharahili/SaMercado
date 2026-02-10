import React from "react";
import { I18nManager } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { RootNavigator } from "@navigation/RootNavigator";
import { theme } from "@theme/theme";
import { AuthProvider } from "@hooks/useAuth";
import { useRegisterPushToken } from "@hooks/useRegisterPushToken";
// Ensure RTL for Arabic
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  // Note: in a real device this may require app reload; acceptable for initial setup.
}

export default function App() {
  useRegisterPushToken();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: "#ffffff",
      text: theme.colors.text,
      border: "#e5e7eb",
      notification: theme.colors.primary,
    },
  };

  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="light" />
    </AuthProvider>
  );
}

