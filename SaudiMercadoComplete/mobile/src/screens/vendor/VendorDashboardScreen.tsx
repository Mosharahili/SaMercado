import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VendorStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useLanguage } from '@hooks/useLanguage';

type Props = NativeStackScreenProps<VendorStackParamList, 'VendorDashboard'>;

export const VendorDashboardScreen = ({ navigation }: Props) => {
  const { tr, isRTL } = useLanguage();

  return (
    <ScreenContainer contentStyle={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <AppHeader title={tr('بوابة البائع', 'Vendor Portal')} subtitle={tr('إدارة المنتجات والطلبات والتحليلات', 'Manage products, orders, and analytics')} />
      <View style={styles.list}>
        <AppButton label={tr('إدارة المنتجات', 'Manage Products')} onPress={() => navigation.navigate('VendorProducts')} />
        <AppButton label={tr('إدارة الطلبات', 'Manage Orders')} onPress={() => navigation.navigate('VendorOrders')} />
        <AppButton label={tr('تحليلات البائع', 'Vendor Analytics')} onPress={() => navigation.navigate('VendorAnalytics')} />
        <AppButton label={tr('الدعم والمراسلة', 'Support & Messaging')} onPress={() => navigation.navigate('VendorSupport')} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: { gap: 10 },
});
