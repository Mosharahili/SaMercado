import 'react-native-gesture-handler';
import { I18nManager, Text, TextInput, Image, StyleSheet, View } from 'react-native';
import React, { useEffect, useState } from 'react';
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

const applyGlobalRtlTextDefaults = () => {
  const rtlTextStyle = { writingDirection: 'rtl', textAlign: 'right' };
  const rtlInputStyle = { writingDirection: 'rtl', textAlign: 'right' };
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
    console.log('RTL mode enabled. Restart the app once if layout is still LTR.');
  }
};

const AppInner = () => {
  useRegisterPushToken();
  const { isLoading } = useLanguage();
  const [showStartupSplash, setShowStartupSplash] = useState(true);

  useEffect(() => {
    ensureRtlEnabled();
    applyGlobalRtlTextDefaults();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowStartupSplash(false), STARTUP_SPLASH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showStartupSplash) {
    return <StartupSplash />;
  }

  return (
    <View style={styles.root}>
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
