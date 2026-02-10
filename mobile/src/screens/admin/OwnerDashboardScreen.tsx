import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@theme/theme";
import { useAuth } from "@hooks/useAuth";
import type { AdminStackParamList } from "@navigation/stacks/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "OwnerDashboard">;

export const OwnerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>لوحة تحكم المالك</Text>
        <Text style={styles.subtitle}>إدارة شاملة للمنصة والمستخدمين</Text>
      </View>

      <View style={styles.grid}>
        <DashboardCard
          title="البنرات"
          subtitle="إدارة الإعلانات والعروض"
          icon="📢"
          onPress={() => navigation.navigate("Banners")}
        />
        <DashboardCard
          title="النوافذ المنبثقة"
          subtitle="الرسائل المستهدفة"
          icon="💬"
          onPress={() => navigation.navigate("Popups")}
        />
        <DashboardCard
          title="الأسواق"
          subtitle="إدارة الأسواق والمناطق"
          icon="🏪"
          onPress={() => navigation.navigate("Markets")}
        />
        <DashboardCard
          title="البائعون"
          subtitle="إدارة حسابات البائعين"
          icon="👥"
          onPress={() => navigation.navigate("Vendors")}
        />
        <DashboardCard
          title="المنتجات"
          subtitle="مراجعة وإدارة المنتجات"
          icon="📦"
          onPress={() => navigation.navigate("Products")}
        />
        <DashboardCard
          title="الطلبات"
          subtitle="مراقبة وإدارة الطلبات"
          icon="📋"
          onPress={() => navigation.navigate("Orders")}
        />
        <DashboardCard
          title="التحليلات"
          subtitle="التقارير والإحصائيات"
          icon="📊"
          onPress={() => navigation.navigate("Analytics")}
        />
        <DashboardCard
          title="الإعدادات"
          subtitle="إعدادات النظام"
          icon="⚙️"
          onPress={() => navigation.navigate("Settings")}
        />
        <DashboardCard
          title="المدراء"
          subtitle="إدارة صلاحيات المدراء"
          icon="👑"
          onPress={() => navigation.navigate("Admins")}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => void logout()}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const DashboardCard: React.FC<{
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
}> = ({ title, subtitle, icon, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardContent}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: "right",
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  cardContent: {
    alignItems: "center",
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardText: {
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: theme.colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: "center",
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

