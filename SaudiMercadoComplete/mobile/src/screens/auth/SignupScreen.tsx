import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { AuthStackParamList } from '@navigation/types';
import { useAuth } from '@hooks/useAuth';
import { AppButton } from '@components/AppButton';
import { theme } from '@theme/theme';
import { ApiError } from '@api/client';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export const SignupScreen = ({ navigation }: Props) => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password, role });
    } catch (error) {
      const err = error as ApiError;
      Alert.alert('خطأ', err.response?.data?.error || err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradients.app} style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.title}>إنشاء حساب جديد</Text>

          <View style={styles.card}>
            <Text style={styles.label}>الاسم</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

            <Text style={styles.label}>نوع الحساب</Text>
            <View style={styles.pickerWrap}>
              <Picker selectedValue={role} onValueChange={(value) => setRole(value)}>
                <Picker.Item label="عميل" value="CUSTOMER" />
                <Picker.Item label="بائع" value="VENDOR" />
              </Picker>
            </View>

            <AppButton label="إنشاء الحساب" onPress={onSignup} loading={loading} />

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
              <Text style={styles.link}>لديك حساب؟ تسجيل الدخول</Text>
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
    textAlign: 'right',
    color: theme.colors.text,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'right',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0fdf4',
  },
  linkWrap: { marginTop: 8 },
  link: {
    textAlign: 'center',
    color: '#166534',
    fontWeight: '700',
  },
});
