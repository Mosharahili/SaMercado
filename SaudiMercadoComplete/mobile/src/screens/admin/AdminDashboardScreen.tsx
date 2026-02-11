import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useAuth } from '@hooks/useAuth';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

export const AdminDashboardScreen = ({ navigation }: Props) => {
  const { logout } = useAuth();

  return (
    <ScreenContainer>
      <AppHeader title="لوحة الأدمن" subtitle="إدارة التشغيل اليومي" />
      <View style={styles.list}>
        <AppButton label="عرض الأسواق" onPress={() => navigation.navigate('AdminStoreMarkets')} variant="ghost" />
        <AppButton label="تصفح المنتجات" onPress={() => navigation.navigate('AdminStoreProducts')} variant="ghost" />
        <AppButton label="السلة والشراء" onPress={() => navigation.navigate('AdminStoreCart')} variant="ghost" />
        <AppButton label="الحساب" onPress={() => navigation.navigate('AdminStoreAccount')} variant="ghost" />

        <AppButton label="إدارة الأسواق" onPress={() => navigation.navigate('AdminMarkets')} />
        <AppButton label="إدارة المنتجات" onPress={() => navigation.navigate('AdminProducts')} />
        <AppButton label="إدارة الطلبات" onPress={() => navigation.navigate('AdminOrders')} />
        <AppButton label="إدارة المستخدمين" onPress={() => navigation.navigate('AdminUsers')} />

        <AppButton label="تسجيل الخروج" onPress={logout} variant="ghost" />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({ list: { gap: 10 } });
