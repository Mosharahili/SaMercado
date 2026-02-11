import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { StatCard } from '@components/StatCard';
import { useDashboardData } from '@hooks/useDashboardData';

export const VendorAnalyticsScreen = () => {
  const { data } = useDashboardData();
  const metrics = data?.metrics || {};

  return (
    <ScreenContainer>
      <View style={styles.row}>
        <StatCard label="إجمالي المبيعات" value={`${Number(metrics.totalRevenue || 0).toFixed(0)} ر.س`} />
        <StatCard label="إجمالي الطلبات" value={String(metrics.totalOrders || 0)} />
      </View>
      <View style={styles.row}>
        <StatCard label="أفضل المنتجات" value={String((data?.topProducts || []).length)} />
        <StatCard label="النشاط الأسبوعي" value="متوسط" />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
});
