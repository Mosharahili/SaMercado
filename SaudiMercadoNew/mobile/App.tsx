import React from 'react';
import { I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@hooks/useAuth';
import { RootNavigator } from '@navigation/RootNavigator';

// Force RTL
I18nManager.forceRTL(true);

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}