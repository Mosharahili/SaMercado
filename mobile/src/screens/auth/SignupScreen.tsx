import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { theme } from '@theme/theme';
import { AuthStackParamList } from '@navigation/stacks/AuthStack';

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigation = useNavigation<SignupScreenNavigationProp>();

  const handleSignup = async () => {
    try {
      await register(email, password, name);
    } catch (error) {
      Alert.alert('خطأ', 'فشل التسجيل');
    }
  };

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>سعودي ميركادو</Text>
        <Text style={styles.subtitle}>انضم إلينا اليوم</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>إنشاء حساب</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>لديك حساب؟ سجل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'right',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  link: {
    alignItems: 'center',
  },
  linkText: {
    color: 'white',
    fontSize: theme.typography.fontSize.md,
    textDecorationLine: 'underline',
  },
});