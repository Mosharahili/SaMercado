import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

export const AdminDashboardScreen = ({ navigation }: Props) => {
  return (
    <ScreenContainer>
      <AppHeader title="لوحة الأدمن" subtitle="إدارة التشغيل اليومي" />
      <View style={styles.list}>
        <AppButton label="إدارة الأسواق" onPress={() => navigation.navigate('AdminMarkets')} />
        <AppButton label="إدارة المنتجات" onPress={() => navigation.navigate('AdminProducts')} />
        <AppButton label="إدارة الطلبات" onPress={() => navigation.navigate('AdminOrders')} />
        <AppButton label="إدارة المستخدمين" onPress={() => navigation.navigate('AdminUsers')} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({ list: { gap: 10 } });
