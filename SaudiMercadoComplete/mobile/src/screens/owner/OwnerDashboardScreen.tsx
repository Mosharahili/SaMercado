import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useAuth } from '@hooks/useAuth';

const appLinks: Array<{ key: keyof OwnerStackParamList; label: string }> = [
  { key: 'OwnerStoreHome', label: '🏠 وضع العميل - الرئيسية' },
  { key: 'OwnerStoreMarkets', label: '🏪 عرض الأسواق' },
  { key: 'OwnerStoreProducts', label: '🛍 تصفح المنتجات' },
  { key: 'OwnerStoreCart', label: '🛒 السلة والشراء' },
  { key: 'OwnerStoreAccount', label: '👤 الحساب' },
];

const managementLinks: Array<{ key: keyof OwnerStackParamList; label: string }> = [
  { key: 'OwnerBanners', label: '🎯 إدارة البوسترات' },
  { key: 'OwnerPopups', label: '📢 إدارة النوافذ المنبثقة' },
  { key: 'OwnerAdmins', label: '👥 إدارة الأدمن والصلاحيات' },
  { key: 'OwnerMarkets', label: '🏪 إدارة الأسواق' },
  { key: 'OwnerProducts', label: '🛍 إدارة المنتجات' },
  { key: 'OwnerOrders', label: '🧾 إدارة الطلبات' },
  { key: 'OwnerAnalytics', label: '📈 التحليلات' },
  { key: 'OwnerSettings', label: '⚙️ الإعدادات' },
];

type Props = NativeStackScreenProps<OwnerStackParamList, 'OwnerDashboard'>;

export const OwnerDashboardScreen = ({ navigation }: Props) => {
  const { logout } = useAuth();

  return (
    <ScreenContainer>
      <AppHeader title="لوحة المالك" subtitle="تحكم كامل في سعودي ميركادو" />
      <Text style={styles.note}>يمكنك إدارة المنصة وفي نفس الوقت تصفح التطبيق كأي مستخدم.</Text>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>داخل التطبيق</Text>
        {appLinks.map((link) => (
          <AppButton key={link.key} label={link.label} onPress={() => navigation.navigate(link.key)} variant="ghost" />
        ))}
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>لوحة الإدارة</Text>
        {managementLinks.map((link) => (
          <AppButton key={link.key} label={link.label} onPress={() => navigation.navigate(link.key)} />
        ))}
      </View>

      <AppButton label="تسجيل الخروج" onPress={logout} variant="ghost" />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  note: {
    textAlign: 'right',
    color: '#155e75',
    fontWeight: '700',
  },
  group: {
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    padding: 10,
  },
  groupTitle: {
    textAlign: 'right',
    fontWeight: '800',
    color: '#0f2f3d',
  },
});
