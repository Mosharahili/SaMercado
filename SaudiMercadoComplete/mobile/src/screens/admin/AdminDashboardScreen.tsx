import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

export const AdminDashboardScreen = ({ navigation }: Props) => {
  const { logout } = useAuth();
  const { tr, isRTL } = useLanguage();

  return (
    <ScreenContainer>
      <AppHeader title={tr('لوحة الأدمن', 'Admin Panel')} subtitle={tr('إدارة التشغيل اليومي', 'Daily operations management')} />
      <View style={styles.list}>
        <AppButton label={tr('عرض الأسواق', 'View Markets')} onPress={() => navigation.navigate('AdminStoreMarkets')} variant="ghost" />
        <AppButton label={tr('تصفح المنتجات', 'Browse Products')} onPress={() => navigation.navigate('AdminStoreProducts')} variant="ghost" />
        <AppButton label={tr('السلة والشراء', 'Cart & Checkout')} onPress={() => navigation.navigate('AdminStoreCart')} variant="ghost" />
        <AppButton label={tr('الحساب', 'Account')} onPress={() => navigation.navigate('AdminStoreAccount')} variant="ghost" />

        <AppButton label={tr('إدارة الأسواق', 'Manage Markets')} onPress={() => navigation.navigate('AdminMarkets')} />
        <AppButton label={tr('إدارة المنتجات', 'Manage Products')} onPress={() => navigation.navigate('AdminProducts')} />
        <AppButton label={tr('إدارة الطلبات', 'Manage Orders')} onPress={() => navigation.navigate('AdminOrders')} />
        <AppButton label={tr('إدارة المستخدمين', 'Manage Users')} onPress={() => navigation.navigate('AdminUsers')} />

        <AppButton label={tr('تسجيل الخروج', 'Log out')} onPress={logout} variant="ghost" />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({ list: { gap: 10 } });
