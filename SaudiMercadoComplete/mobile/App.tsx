import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider } from '@hooks/useAuth';
import { CartProvider } from '@hooks/useCart';
import { LanguageProvider, useLanguage } from '@hooks/useLanguage';
import { RootNavigator } from '@navigation/RootNavigator';
import { useRegisterPushToken } from '@hooks/useRegisterPushToken';

const STARTUP_SPLASH_DELAY_MS = 3000;
const BaseText = Text as unknown as { defaultProps?: { style?: unknown } };
const BaseTextInput = TextInput as unknown as { defaultProps?: { style?: unknown } };
const BASE_TEXT_STYLE = BaseText.defaultProps?.style;
const BASE_TEXT_INPUT_STYLE = BaseTextInput.defaultProps?.style;

const StartupSplash = () => {
  const { t } = useLanguage();

  return (
    <LinearGradient colors={['#ecfdf3', '#d9fbe8', '#b7f2cb']} style={styles.splashWrap}>
      <View style={styles.splashCard}>
        <Image source={require('./assets/icon.png')} style={styles.splashLogo} resizeMode="cover" />
        <Text style={styles.splashTitle}>{t('auth.appName')}</Text>
        <Text style={styles.splashSubtitle}>SaudiMercado</Text>
      </View>
    </LinearGradient>
  );
};

const AppInner = () => {
  useRegisterPushToken();
  const { isLoading, isRTL } = useLanguage();
  const [showStartupSplash, setShowStartupSplash] = useState(true);

  useEffect(() => {
    const textDefaults = BaseText.defaultProps || {};
    const inputDefaults = BaseTextInput.defaultProps || {};

    const directionStyle = {
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    } as const;

    BaseText.defaultProps = {
      ...textDefaults,
      style: BASE_TEXT_STYLE ? [BASE_TEXT_STYLE, directionStyle] : directionStyle,
    };

    BaseTextInput.defaultProps = {
      ...inputDefaults,
      style: BASE_TEXT_INPUT_STYLE ? [BASE_TEXT_INPUT_STYLE, directionStyle] : directionStyle,
    };
  }, [isRTL]);

  useEffect(() => {
    const timer = setTimeout(() => setShowStartupSplash(false), STARTUP_SPLASH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showStartupSplash) {
    return <StartupSplash />;
  }

  const layoutDirection = isRTL ? 'rtl' : 'ltr';
  return (
    <View key={layoutDirection} style={[styles.root, { direction: layoutDirection }]}>
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
  splashWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  splashCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  splashLogo: {
    width: 162,
    height: 162,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#86efac',
    backgroundColor: '#ffffff',
  },
  splashTitle: {
    marginTop: 8,
    color: '#14532d',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  splashSubtitle: {
    color: '#166534',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
