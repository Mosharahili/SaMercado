import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@hooks/useAuth";
import { theme } from "@theme/theme";

import type { RootStackParamList } from "@navigation/RootNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const AccountScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>الدور: {user.role}</Text>

          {(user.role === "ADMIN" || user.role === "OWNER") && (
            <TouchableOpacity
              style={styles.dashboardBtn}
              onPress={() => navigation.navigate("Admin")}
            >
              <Text style={styles.dashboardText}>فتح لوحة تحكم المالك / الأدمن</Text>
            </TouchableOpacity>
          )}

          {(user.role === "VENDOR" || user.role === "OWNER") && (
            <TouchableOpacity
              style={styles.dashboardBtn}
              onPress={() => navigation.navigate("Vendor")}
            >
              <Text style={styles.dashboardText}>فتح لوحة تحكم البائع</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.name}>ضيف غير مسجل</Text>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={() => void logout()}>
        <Text style={styles.logoutText}>{user ? "تسجيل الخروج" : "تسجيل الدخول"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 16,
  },
  logoutBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  dashboardBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dashboardText: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});

