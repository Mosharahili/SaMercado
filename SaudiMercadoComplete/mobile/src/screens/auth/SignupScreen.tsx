import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/types';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { AppButton } from '@components/AppButton';
import { theme } from '@theme/theme';
import { ApiError } from '@api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export const SignupScreen = ({ navigation }: Props) => {
  const { signup } = useAuth();
  const { t, isRTL } = useLanguage();
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
          <Text style={[styles.title, { }]}>{t('auth.signup')}</Text>

          <View style={styles.card}>
            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('auth.name')}</Text>
            <TextInput 
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
              value={name} 
              onChangeText={setName}
              placeholderTextColor="#999"
            />

            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('auth.email')}</Text>
            <TextInput
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('auth.password')}</Text>
            <TextInput 
              style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry
              placeholderTextColor="#999"
            />

            <AppButton label={t('auth.signup')} onPress={onSignup} loading={loading} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
              <Text style={[styles.link, { textAlign: isRTL ? 'right' : 'left' }]}>{t('auth.hasAccount')}</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkWrap: { marginTop: 8 },
  link: {
    textAlign: 'center',
    color: '#166534',
    fontWeight: '700',
  },
});
