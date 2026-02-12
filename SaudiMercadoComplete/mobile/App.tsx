import 'react-native-gesture-handler';
import React from 'react';
import { I18nManager } from 'react-native';
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
  return <RootNavigator />;
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
