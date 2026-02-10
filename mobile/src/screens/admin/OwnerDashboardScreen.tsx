import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@theme/theme";
import type { AdminStackParamList } from "@navigation/stacks/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "OwnerDashboard">;

export const OwnerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>لوحة تحكم المالك</Text>
      <View style={styles.grid}>
        <DashboardTile label="البنرات" onPress={() => navigation.navigate("Banners")} />
        <DashboardTile label="النوافذ المنبثقة" onPress={() => navigation.navigate("Popups")} />
        <DashboardTile label="الأسواق" onPress={() => navigation.navigate("Markets")} />
        <DashboardTile label="البائعون" onPress={() => navigation.navigate("Vendors")} />
        <DashboardTile label="المنتجات" onPress={() => navigation.navigate("Products")} />
        <DashboardTile label="الطلبات" onPress={() => navigation.navigate("Orders")} />
        <DashboardTile label="التحليلات" onPress={() => navigation.navigate("Analytics")} />
        <DashboardTile label="الإعدادات" onPress={() => navigation.navigate("Settings")} />
        <DashboardTile label="المدراء" onPress={() => navigation.navigate("Admins")} />
      </View>
    </View>
  );
};

const DashboardTile: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <Text style={styles.tileText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  tile: {
    width: "46%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    margin: 4,
  },
  tileText: {
    textAlign: "right",
    fontWeight: "600",
    color: theme.colors.text,
  },
});

