import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import axios from "axios";

import { api } from "@api/client";
import { useAuth } from "@hooks/useAuth";
import { theme } from "@theme/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@navigation/stacks/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("خطأ", "الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/auth/login", { email, password });
      await login({
        id: res.data.user.id,
        name: res.data.user.name,
        role: res.data.user.role,
        token: res.data.token,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as any;
        const message =
          (data && (data.message || data.error)) ||
          (typeof data === "string" ? data : undefined) ||
          "تعذّر تسجيل الدخول، حاول مرة أخرى";
        Alert.alert("خطأ", message);
      } else {
        Alert.alert("خطأ", "حدث خطأ غير متوقع، حاول مرة أخرى");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>تسجيل الدخول</Text>
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={onLogin} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? "جاري الدخول..." : "دخول"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.linkText}>مستخدم جديد؟ إنشاء حساب</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  card: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    textAlign: "right",
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  linkText: {
    marginTop: 12,
    textAlign: "center",
    color: theme.colors.muted,
  },
});

