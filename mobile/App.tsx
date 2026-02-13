import React from "react";
import { I18nManager, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { RootNavigator } from "@navigation/RootNavigator";
import { theme } from "@theme/theme";
import { AuthProvider } from "@hooks/useAuth";
import { useRegisterPushToken } from "@hooks/useRegisterPushToken";

const applyGlobalRtlTextDefaults = () => {
  const rtlTextStyle = { writingDirection: "rtl" as const, textAlign: "right" as const };
  const rtlInputStyle = { writingDirection: "rtl" as const, textAlign: "right" as const };

  const textDefaults = (Text as unknown as { defaultProps?: { style?: unknown } }).defaultProps || {};
  const textStyle = textDefaults.style;
  (Text as unknown as { defaultProps: { style: unknown } }).defaultProps = {
    ...textDefaults,
    style: textStyle ? [rtlTextStyle, textStyle] : rtlTextStyle,
  };

  const inputDefaults = (TextInput as unknown as { defaultProps?: { style?: unknown } }).defaultProps || {};
  const inputStyle = inputDefaults.style;
  (TextInput as unknown as { defaultProps: { style: unknown } }).defaultProps = {
    ...inputDefaults,
    style: inputStyle ? [rtlInputStyle, inputStyle] : rtlInputStyle,
  };
};

const ensureRtlEnabled = () => {
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
  I18nManager.forceRTL(true);
  if (__DEV__ && !I18nManager.isRTL) {
    // forceRTL takes effect after app restart.
    console.log("RTL mode enabled. Restart the app once if layout is still LTR.");
  }
};

ensureRtlEnabled();
applyGlobalRtlTextDefaults();

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
      <View style={styles.rtlRoot}>
        <NavigationContainer theme={navTheme} direction="rtl">
          <RootNavigator />
        </NavigationContainer>
      </View>
      <StatusBar style="light" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  rtlRoot: {
    flex: 1,
    direction: "rtl",
  },
});
