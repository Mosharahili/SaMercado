import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuth } from "@hooks/useAuth";
import { theme } from "@theme/theme";

export const AccountScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>الدور: {user.role}</Text>
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
});

