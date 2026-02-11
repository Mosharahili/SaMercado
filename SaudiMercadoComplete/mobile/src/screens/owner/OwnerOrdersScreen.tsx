import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { api } from '@api/client';

const statusOptions = ['NEW', 'PROCESSING', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export const OwnerOrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);

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

  const setStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر تحديث الحالة');
    }
  };

  return (
    <ScreenContainer>
      {orders.map((order) => (
        <View key={order.id} style={styles.item}>
          <Text style={styles.title}>#{order.orderNumber}</Text>
          <Text style={styles.meta}>الحالة الحالية: {order.status}</Text>
          <Text style={styles.meta}>طريقة الدفع: {order.payment?.method}</Text>
          <Text style={styles.meta}>المجموع: {order.totalAmount} ر.س</Text>

          <View style={styles.pickerWrap}>
            <Picker selectedValue={order.status} onValueChange={(status) => setStatus(order.id, status)}>
              {statusOptions.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  item: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 12, gap: 5 },
  title: { textAlign: 'right', fontWeight: '900', color: '#14532d' },
  meta: { textAlign: 'right', color: '#4b5563' },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdf4',
  },
});
