import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { AppButton } from '@components/AppButton';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { theme } from '@theme/theme';
import { ApiError } from '@api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('alert.notice'), t('auth.fillLogin'));
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      const err = error as ApiError;
      Alert.alert(t('alert.error'), err.response?.data?.error || err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradients.app} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <LanguageSwitcher />
          <Image source={require('../../../assets/icon.png')} style={styles.logo} resizeMode="cover" />
          <Text style={styles.title}>{t('auth.appName')}</Text>
          <Text style={styles.subtitle}>{t('auth.tagline')}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>{t('auth.email')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>{t('auth.password')}</Text>
            <TextInput 
              style={styles.input}
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry
              placeholderTextColor="#999"
            />

            <AppButton label={t('auth.login')} onPress={onLogin} loading={loading} />

            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkWrap}>
              <Text style={styles.link}>{t('auth.noAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#dcfce7',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkWrap: { marginTop: 10 },
  link: {
    textAlign: 'center',
    color: '#166534',
    fontWeight: '700',
  },
});
