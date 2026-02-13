import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { StatCard } from '@components/StatCard';
import { useDashboardData } from '@hooks/useDashboardData';
import { useLanguage } from '@hooks/useLanguage';

export const OwnerAnalyticsScreen = () => {
  const { data } = useDashboardData();
  const { isRTL, tr } = useLanguage();
  const metrics = data?.metrics || {};

  return (
    <ScreenContainer>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <StatCard label={tr('إجمالي الطلبات', 'Total Orders')} value={String(metrics.totalOrders || 0)} />
        <StatCard label={tr('إجمالي الإيرادات', 'Total Revenue')} value={`${Number(metrics.totalRevenue || 0).toFixed(0)} ر.س`} />
      </View>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <StatCard label={tr('إجمالي المنتجات', 'Total Products')} value={String(metrics.totalProducts || 0)} />
        <StatCard label={tr('إجمالي البائعين', 'Total Vendors')} value={String(metrics.totalVendors || 0)} />
      </View>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <StatCard label={tr('معدل التحويل', 'Conversion Rate')} value={`${metrics.conversionRate || 0}%`} />
        <StatCard label={tr('معدل التخلي عن السلة', 'Cart Abandonment')} value={`${metrics.cartAbandonmentRate || 0}%`} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('أكثر المنتجات مبيعًا', 'Top Selling Products')}</Text>
        {(data?.topProducts || []).map((product: any) => (
          <Text key={product.productId} style={[styles.line, { textAlign: isRTL ? 'right' : 'left' }]}>{`${product.name} - ${product._sum?.quantity || 0}`}</Text>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#14532d',
    fontSize: 16,
  },
  line: {
    color: '#4b5563',
  },
});
