import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VendorStackParamList } from '@navigation/types';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';

type Props = NativeStackScreenProps<VendorStackParamList, 'VendorDashboard'>;

export const VendorDashboardScreen = ({ navigation }: Props) => {
  return (
    <ScreenContainer>
      <AppHeader title="بوابة البائع" subtitle="إدارة المنتجات والطلبات والتحليلات" />
      <View style={styles.list}>
        <AppButton label="إدارة المنتجات" onPress={() => navigation.navigate('VendorProducts')} />
        <AppButton label="إدارة الطلبات" onPress={() => navigation.navigate('VendorOrders')} />
        <AppButton label="تحليلات البائع" onPress={() => navigation.navigate('VendorAnalytics')} />
        <AppButton label="الدعم والمراسلة" onPress={() => navigation.navigate('VendorSupport')} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: { gap: 10 },
});
