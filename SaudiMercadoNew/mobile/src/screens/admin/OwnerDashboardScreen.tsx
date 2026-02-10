import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '@navigation/stacks/AdminStack';
import { theme } from '@theme/theme';

type OwnerDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'OwnerDashboard'>;

export const OwnerDashboardScreen = () => {
  const navigation = useNavigation<OwnerDashboardNavigationProp>();

  const menuItems = [
    { title: 'إدارة الإعلانات', screen: 'Banners' as const },
    { title: 'إدارة النوافذ المنبثقة', screen: 'Popups' as const },
    { title: 'إدارة الأسواق', screen: 'MarketsManagement' as const },
    { title: 'إدارة البائعين', screen: 'VendorsManagement' as const },
    { title: 'إدارة المنتجات', screen: 'ProductsManagement' as const },
    { title: 'إدارة الطلبات', screen: 'OrdersManagement' as const },
    { title: 'إدارة المشرفين', screen: 'AdminsManagement' as const },
    { title: 'التحليلات', screen: 'Analytics' as const },
    { title: 'الإعدادات', screen: 'Settings' as const },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>لوحة تحكم المالك</Text>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>1250</Text>
          <Text style={styles.statLabel}>إجمالي الطلبات</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>ر.س 45,000</Text>
          <Text style={styles.statLabel}>إجمالي الإيرادات</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>85</Text>
          <Text style={styles.statLabel}>البائعين النشطين</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  menu: {
    padding: theme.spacing.md,
  },
  menuItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  menuItemText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
});