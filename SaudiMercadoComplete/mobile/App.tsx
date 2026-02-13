import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@hooks/useAuth';
import { CartProvider } from '@hooks/useCart';
import { RootNavigator } from '@navigation/RootNavigator';
import { useRegisterPushToken } from '@hooks/useRegisterPushToken';

const applyGlobalRtlTextDefaults = () => {
  const rtlTextStyle = { writingDirection: 'rtl' as const, textAlign: 'right' as const };
  const rtlInputStyle = { writingDirection: 'rtl' as const, textAlign: 'right' as const };

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
    // forceRTL is applied on the next app start.
    console.log('RTL mode enabled. Restart the app once if layout is still LTR.');
  }
};

ensureRtlEnabled();
applyGlobalRtlTextDefaults();

const AppInner = () => {
  useRegisterPushToken();
  return (
    <View style={styles.rtlRoot}>
      <RootNavigator />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
        <StatusBar style="light" />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  rtlRoot: {
    flex: 1,
    direction: 'rtl',
  },
});
