import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useAuth } from '@hooks/useAuth';
import { api } from '@api/client';
import { Order } from '@app-types/models';

export const AccountScreen = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    if (user?.role !== 'CUSTOMER') return;
    try {
      const response = await api.get<{ orders: Order[] }>('/orders');
      setOrders(response.orders || []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id, user?.role]);

  return (
    <ScreenContainer>
      <AppHeader title="الحساب" subtitle="إدارة الملف الشخصي" />

      <View style={styles.card}>
        <Text style={styles.label}>الاسم</Text>
        <Text style={styles.value}>{user?.name || '-'}</Text>

        <Text style={styles.label}>البريد الإلكتروني</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>إشعارات الحساب</Text>
        <Pressable style={styles.noticeItem}>
          <Text style={styles.noticeText}>تحديث حالة الطلبات - مفعل</Text>
        </Pressable>
        <Pressable style={styles.noticeItem}>
          <Text style={styles.noticeText}>العروض الترويجية - مفعل</Text>
        </Pressable>
      </View>

      {user?.role === 'CUSTOMER' ? (
        <View style={styles.card}>
          <Text style={styles.label}>طلباتي</Text>
          {!orders.length ? <Text style={styles.value}>لا توجد طلبات بعد</Text> : null}
          {orders.slice(0, 8).map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <Text style={styles.orderLine}>#{order.orderNumber}</Text>
              <Text style={styles.orderLine}>الحالة: {order.status}</Text>
              <Text style={styles.orderLine}>الإجمالي: {order.totalAmount} ر.س</Text>
            </View>
          ))}
          <AppButton label="تحديث الطلبات" onPress={loadOrders} variant="ghost" />
        </View>
      ) : null}

      <AppButton label="تسجيل الخروج" onPress={logout} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  label: {
    textAlign: 'right',
    color: '#166534',
    fontWeight: '700',
  },
  value: {
    textAlign: 'right',
    color: '#052e16',
    fontSize: 16,
  },
  noticeItem: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 10,
  },
  noticeText: {
    textAlign: 'right',
    color: '#14532d',
  },
  orderItem: {
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f0fdf4',
    gap: 2,
  },
  orderLine: {
    textAlign: 'right',
    color: '#14532d',
    fontWeight: '600',
  },
});
