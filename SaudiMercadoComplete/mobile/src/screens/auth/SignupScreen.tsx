import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { AppButton } from '@components/AppButton';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { theme } from '@theme/theme';
import { ApiError } from '@api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export const SignupScreen = ({ navigation }: Props) => {
  const { signup } = useAuth();
  const { isRTL, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(t('alert.notice'), t('auth.fillAll'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('alert.notice'), t('auth.passwordMin'));
      return;
    }

    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
    } catch (error) {
      const err = error as ApiError;
      Alert.alert(t('alert.error'), err.response?.data?.error || err.message || t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradients.app} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <LanguageSwitcher />
          <Text style={styles.title}>{t('auth.signup')}</Text>

          <View style={styles.card}>
            <Text style={[styles.label, isRTL ? styles.labelRTL : styles.labelLTR]}>{t('auth.name')}</Text>
            <TextInput style={[styles.input, isRTL ? styles.inputRTL : styles.inputLTR]} value={name} onChangeText={setName} />

            <Text style={[styles.label, isRTL ? styles.labelRTL : styles.labelLTR]}>{t('auth.email')}</Text>
            <TextInput
              style={[styles.input, isRTL ? styles.inputRTL : styles.inputLTR]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, isRTL ? styles.labelRTL : styles.labelLTR]}>{t('auth.password')}</Text>
            <TextInput style={[styles.input, isRTL ? styles.inputRTL : styles.inputLTR]} value={password} onChangeText={setPassword} secureTextEntry />

            <AppButton label={t('auth.signup')} onPress={onSignup} loading={loading} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
              <Text style={styles.link}>{t('auth.hasAccount')}</Text>
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
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
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
  labelRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  labelLTR: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputLTR: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  linkWrap: { marginTop: 8 },
  link: {
    textAlign: 'center',
    color: '#166534',
    fontWeight: '700',
  },
});
