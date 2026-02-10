import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@theme/theme";

export const PopupsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>إدارة النوافذ المنبثقة</Text>
      <Text style={styles.subtitle}>
        من هنا يتم إنشاء الرسائل المنبثقة، استهداف المستخدمين، وتحديد مواعيد الظهور والانتهاء.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "right",
  },
});

