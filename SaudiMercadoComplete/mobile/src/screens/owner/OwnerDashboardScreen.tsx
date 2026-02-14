import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';

type Props = NativeStackScreenProps<OwnerStackParamList, 'OwnerDashboard'>;

export const OwnerDashboardScreen = ({ navigation }: Props) => {
  const { logout } = useAuth();
  const { isRTL, tr } = useLanguage();
  const appLinks: Array<{ key: keyof OwnerStackParamList; label: string }> = [
    { key: 'OwnerStoreHome', label: tr('🏠 وضع العميل - الرئيسية', '🏠 Customer Mode - Home') },
    { key: 'OwnerStoreMarkets', label: tr('🏪 عرض الأسواق', '🏪 View Markets') },
    { key: 'OwnerStoreProducts', label: tr('🛍 تصفح المنتجات', '🛍 Browse Products') },
    { key: 'OwnerStoreCart', label: tr('🛒 السلة والشراء', '🛒 Cart & Checkout') },
    { key: 'OwnerStoreAccount', label: tr('👤 الحساب', '👤 Account') },
  ];

  const managementLinks: Array<{ key: keyof OwnerStackParamList; label: string }> = [
    { key: 'OwnerBanners', label: tr('🎯 إدارة البوسترات', '🎯 Banner Manager') },
    { key: 'OwnerPopups', label: tr('📢 إدارة النوافذ المنبثقة', '📢 Popup Manager') },
    { key: 'OwnerAdmins', label: tr('👥 إدارة الأدمن والصلاحيات', '👥 Admins & Permissions') },
    { key: 'OwnerMarkets', label: tr('🏪 إدارة الأسواق', '🏪 Manage Markets') },
    { key: 'OwnerProducts', label: tr('🛍 إدارة المنتجات', '🛍 Manage Products') },
    { key: 'OwnerOrders', label: tr('🧾 إدارة الطلبات', '🧾 Manage Orders') },
    { key: 'OwnerAnalytics', label: tr('📈 التحليلات', '📈 Analytics') },
    { key: 'OwnerSettings', label: tr('⚙️ الإعدادات', '⚙️ Settings') },
  ];

  return (
    <ScreenContainer contentStyle={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <AppHeader title={tr('لوحة المالك', 'Owner Dashboard')} subtitle={tr('تحكم كامل في سعودي ميركادو', 'Full control of Saudi Mercado')} />
      <Text style={[styles.note, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('يمكنك إدارة المنصة وفي نفس الوقت تصفح التطبيق كأي مستخدم.', 'You can manage the platform and browse the app as a customer at the same time.')}</Text>

      <View style={styles.group}>
        <Text style={[styles.groupTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('داخل التطبيق', 'Inside App')}</Text>
        {appLinks.map((link) => (
          <AppButton key={link.key} label={link.label} onPress={() => navigation.navigate(link.key)} variant="ghost" />
        ))}
      </View>

      <View style={styles.group}>
        <Text style={[styles.groupTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('لوحة الإدارة', 'Management')}</Text>
        {managementLinks.map((link) => (
          <AppButton key={link.key} label={link.label} onPress={() => navigation.navigate(link.key)} />
        ))}
      </View>

      <AppButton label={tr('تسجيل الخروج', 'Log out')} onPress={logout} variant="ghost" />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  note: {
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
    fontWeight: '800',
    color: '#0f2f3d',
  },
});
