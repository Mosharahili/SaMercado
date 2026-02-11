import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';

const quickLinks: Array<{ key: keyof OwnerStackParamList; label: string }> = [
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
  return (
    <ScreenContainer>
      <AppHeader title="لوحة المالك" subtitle="تحكم كامل في سعودي ميركادو" />
      <Text style={styles.note}>Super Admin Control Panel</Text>

      <View style={styles.grid}>
        {quickLinks.map((link) => (
          <View key={link.key} style={styles.item}>
            <AppButton label={link.label} onPress={() => navigation.navigate(link.key)} />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  note: {
    textAlign: 'right',
    color: '#dcfce7',
    fontWeight: '700',
  },
  grid: {
    gap: 10,
  },
  item: {
    width: '100%',
  },
});
