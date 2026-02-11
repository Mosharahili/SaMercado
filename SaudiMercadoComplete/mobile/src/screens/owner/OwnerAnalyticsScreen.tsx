import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { StatCard } from '@components/StatCard';
import { useDashboardData } from '@hooks/useDashboardData';

export const OwnerAnalyticsScreen = () => {
  const { data } = useDashboardData();
  const metrics = data?.metrics || {};

  return (
    <ScreenContainer>
      <View style={styles.row}>
        <StatCard label="إجمالي الطلبات" value={String(metrics.totalOrders || 0)} />
        <StatCard label="إجمالي الإيرادات" value={`${Number(metrics.totalRevenue || 0).toFixed(0)} ر.س`} />
      </View>
      <View style={styles.row}>
        <StatCard label="إجمالي المنتجات" value={String(metrics.totalProducts || 0)} />
        <StatCard label="إجمالي البائعين" value={String(metrics.totalVendors || 0)} />
      </View>
      <View style={styles.row}>
        <StatCard label="معدل التحويل" value={`${metrics.conversionRate || 0}%`} />
        <StatCard label="معدل التخلي عن السلة" value={`${metrics.cartAbandonmentRate || 0}%`} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أكثر المنتجات مبيعًا</Text>
        {(data?.topProducts || []).map((product: any) => (
          <Text key={product.productId} style={styles.line}>{`${product.name} - ${product._sum?.quantity || 0}`}</Text>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  sectionTitle: {
    textAlign: 'right',
    fontWeight: '900',
    color: '#14532d',
    fontSize: 16,
  },
  line: {
    textAlign: 'right',
    color: '#4b5563',
  },
});
