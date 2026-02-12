import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { DevSettings, I18nManager, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@hooks/useAuth';
import { CartProvider } from '@hooks/useCart';
import { RootNavigator } from '@navigation/RootNavigator';
import { useRegisterPushToken } from '@hooks/useRegisterPushToken';

// The app language is Arabic-first; force RTL to keep layout consistent across Android devices.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
I18nManager.swapLeftAndRightInRTL(true);

const AppInner = () => {
  useRegisterPushToken();
  const [rtlReady, setRtlReady] = useState(I18nManager.isRTL);

  useEffect(() => {
    const ensureRtl = async () => {
      if (I18nManager.isRTL) {
        setRtlReady(true);
        return;
      }

      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      I18nManager.swapLeftAndRightInRTL(true);

      try {
        if (__DEV__) {
          DevSettings.reload();
          return;
        }
      } catch {
        // Ignore reload failures and continue with forced direction styles.
      }

      setRtlReady(true);
    };

    ensureRtl();
  }, []);

  if (!rtlReady) return null;

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
