import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@hooks/useAuth';
import { CartProvider } from '@hooks/useCart';
import { LanguageProvider, useLanguage } from '@hooks/useLanguage';
import { RootNavigator } from '@navigation/RootNavigator';
import { useRegisterPushToken } from '@hooks/useRegisterPushToken';

const AppInner = () => {
  useRegisterPushToken();
  const { isRTL, isLoading } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2f9e44" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <RootNavigator />
    </View>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AppInner />
          <StatusBar style="light" />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2fbf4',
  },
});
