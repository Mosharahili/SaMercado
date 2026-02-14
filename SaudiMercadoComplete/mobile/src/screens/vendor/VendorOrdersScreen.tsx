import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';

const statuses = ['NEW', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED'];
const statusLabelsAr: Record<string, string> = {
  NEW: 'جديد',
  PREPARING: 'جاري التحضير',
  READY_FOR_DELIVERY: 'جاهز للتوصيل',
  COMPLETED: 'مكتمل',
};
const statusLabelsEn: Record<string, string> = {
  NEW: 'New',
  PREPARING: 'Preparing',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  COMPLETED: 'Completed',
};

export const VendorOrdersScreen = () => {
  const { isRTL, tr } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const labels = isRTL ? statusLabelsAr : statusLabelsEn;

  const load = async () => {
    try {
      const response = await api.get<{ orders: any[] }>('/orders');
      setOrders(response.orders || []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('فشل التحديث', 'Update failed'));
    }
  };

  return (
    <ScreenContainer contentStyle={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {orders.map((order) => (
        <View key={order.id} style={styles.item}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('طلب', 'Order')}: {order.orderNumber}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('العميل', 'Customer')}: {order.customer?.name || '-'}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الحالة', 'Status')}: {labels[order.status] || order.status}</Text>

          <View style={styles.pickerWrap}>
            <Picker selectedValue={order.status} onValueChange={(status) => updateStatus(order.id, status)}>
              {statuses.map((status) => (
                <Picker.Item key={status} label={labels[status]} value={status} />
              ))}
            </Picker>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  item: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 12, gap: 4 },
  title: { fontWeight: '800', color: '#14532d' },
  meta: { color: '#4b5563' },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdf4',
  },
});
