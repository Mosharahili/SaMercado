import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { StatCard } from '@components/StatCard';
import { useDashboardData } from '@hooks/useDashboardData';
import { useLanguage } from '@hooks/useLanguage';

export const VendorAnalyticsScreen = () => {
  const { data } = useDashboardData();
  const { isRTL, tr } = useLanguage();
  const metrics = data?.metrics || {};

  return (
    <ScreenContainer contentStyle={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <View style={[styles.row, { }]}>
        <StatCard label={tr('إجمالي المبيعات', 'Total Sales')} value={`${Number(metrics.totalRevenue || 0).toFixed(0)} ر.س`} />
        <StatCard label={tr('إجمالي الطلبات', 'Total Orders')} value={String(metrics.totalOrders || 0)} />
      </View>
      <View style={[styles.row, { }]}>
        <StatCard label={tr('أفضل المنتجات', 'Top Products')} value={String((data?.topProducts || []).length)} />
        <StatCard label={tr('النشاط الأسبوعي', 'Weekly Activity')} value={tr('متوسط', 'Average')} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  row: {
        gap: 10,
  },
});
