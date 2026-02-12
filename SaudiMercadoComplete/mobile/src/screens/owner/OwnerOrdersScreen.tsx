import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api } from '@api/client';

const statusOptions = ['NEW', 'PROCESSING', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export const OwnerOrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  const load = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const query = (searchTerm ?? orderSearch).trim();
      const response = await api.get<{ orders: any[] }>(
        `/orders${query ? `?orderNumber=${encodeURIComponent(query)}` : ''}`
      );
      setOrders(response.orders || []);
    } catch (error: any) {
      setOrders([]);
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر تحميل الطلبات');
    } finally {
      setLoading(false);
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
      <View style={styles.searchRow}>
        <Pressable style={styles.searchBtn} onPress={() => load(orderSearch)}>
          <Text style={styles.searchBtnText}>بحث</Text>
        </Pressable>
        <TextInput
          style={styles.searchInput}
          value={orderSearch}
          onChangeText={setOrderSearch}
          placeholder="ابحث برقم الطلب"
          placeholderTextColor="#64748b"
          textAlign="right"
          onSubmitEditing={() => load(orderSearch)}
        />
      </View>
      <AppButton label={loading ? 'جارِ التحديث...' : 'تحديث الطلبات'} onPress={() => load()} variant="ghost" />

      {!orders.length ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>لا توجد طلبات حالياً</Text>
          <Text style={styles.emptySub}>عند إتمام أي عملية شراء ستظهر هنا مباشرة.</Text>
        </View>
      ) : null}

      {orders.map((order) => (
        <View key={order.id} style={styles.item}>
          <Text style={styles.title}>#{order.orderNumber}</Text>
          <Text style={styles.meta}>العميل: {order.customer?.name || '-'}</Text>
          <Text style={styles.meta}>السوق: {order.market?.name || '-'}</Text>
          <Text style={styles.meta}>طريقة الدفع: {order.payment?.method || '-'}</Text>
          <Text style={styles.meta}>حالة الدفع: {order.payment?.status || '-'}</Text>
          <Text style={styles.meta}>الإجمالي: {order.totalAmount} ر.س</Text>

          <View style={styles.itemsWrap}>
            {(order.items || []).map((item: any) => (
              <Text key={item.id} style={styles.itemLine}>
                {item.product?.name} x {item.quantity}
              </Text>
            ))}
          </View>

          <View style={styles.pickerWrap}>
            <Picker selectedValue={order.status} onValueChange={(status) => setStatus(order.id, status)}>
              {statusOptions.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          </View>

          <Pressable onPress={() => load()} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>حفظ الحالة</Text>
          </Pressable>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  searchBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  emptyText: {
    textAlign: 'right',
    color: '#0f2f3d',
    fontWeight: '800',
  },
  emptySub: {
    textAlign: 'right',
    color: '#4a6572',
  },
  item: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 12, gap: 5 },
  title: { textAlign: 'right', fontWeight: '900', color: '#0f2f3d' },
  meta: { textAlign: 'right', color: '#4a6572' },
  itemsWrap: {
    borderWidth: 1,
    borderColor: '#cffafe',
    borderRadius: 10,
    padding: 8,
    gap: 2,
    backgroundColor: '#ecfeff',
  },
  itemLine: {
    textAlign: 'right',
    color: '#155e75',
    fontSize: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdfa',
  },
  refreshBtn: {
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: '#ccfbf1',
    paddingVertical: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#0f766e',
    fontWeight: '700',
  },
});
