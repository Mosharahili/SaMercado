import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';

const statusOptions = ['NEW', 'PROCESSING', 'PREPARING', 'READY_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const statusLabelsAr: Record<string, string> = {
  NEW: 'جديد',
  PROCESSING: 'قيد المعالجة',
  PREPARING: 'جاري التحضير',
  READY_FOR_DELIVERY: 'جاهز للتوصيل',
  DELIVERED: 'تم التسليم',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

const statusLabelsEn: Record<string, string> = {
  NEW: 'New',
  PROCESSING: 'Processing',
  PREPARING: 'Preparing',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const paymentMethodLabelsAr: Record<string, string> = {
  MADA: 'مدى',
  APPLE_PAY: 'Apple Pay',
  CASH_ON_DELIVERY: 'الدفع عند الاستلام',
};

const paymentMethodLabelsEn: Record<string, string> = {
  MADA: 'Mada',
  APPLE_PAY: 'Apple Pay',
  CASH_ON_DELIVERY: 'Cash on Delivery',
};

const paymentStatusLabelsAr: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  SUCCEEDED: 'ناجح',
  FAILED: 'فاشل',
  REFUNDED: 'مسترد',
};

const paymentStatusLabelsEn: Record<string, string> = {
  PENDING: 'Pending',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const OwnerOrdersScreen = () => {
  const { isRTL, tr } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const statusLabels = isRTL ? statusLabelsAr : statusLabelsEn;
  const paymentMethodLabels = isRTL ? paymentMethodLabelsAr : paymentMethodLabelsEn;
  const paymentStatusLabels = isRTL ? paymentStatusLabelsAr : paymentStatusLabelsEn;

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
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر تحميل الطلبات', 'Unable to load orders'));
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
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر تحديث الحالة', 'Unable to update status'));
    }
  };

  return (
    <ScreenContainer>
      <View style={[styles.searchRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable style={styles.searchBtn} onPress={() => load(orderSearch)}>
          <Text style={styles.searchBtnText}>{tr('بحث', 'Search')}</Text>
        </Pressable>
        <TextInput
          style={styles.searchInput}
          value={orderSearch}
          onChangeText={setOrderSearch}
          placeholder={tr('ابحث برقم الطلب', 'Search by order number')}
          placeholderTextColor="#64748b"
          textAlign={isRTL ? 'right' : 'left'}
          onSubmitEditing={() => load(orderSearch)}
        />
      </View>
      <AppButton label={loading ? tr('جارِ التحديث...', 'Refreshing...') : tr('تحديث الطلبات', 'Refresh Orders')} onPress={() => load()} variant="ghost" />

      {!orders.length ? (
        <View style={styles.emptyCard}>
          <Text style={[styles.emptyText, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('لا توجد طلبات حالياً', 'No orders right now')}</Text>
          <Text style={[styles.emptySub, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('عند إتمام أي عملية شراء ستظهر هنا مباشرة.', 'Completed purchases will appear here automatically.')}</Text>
        </View>
      ) : null}

      {orders.map((order) => (
        <View key={order.id} style={styles.item}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>#{order.orderNumber}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('العميل', 'Customer')}: {order.customer?.name || '-'}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('السوق', 'Market')}: {order.market?.name || '-'}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('طريقة الدفع', 'Payment Method')}: {paymentMethodLabels[order.payment?.method] || order.payment?.method || '-'}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('حالة الدفع', 'Payment Status')}: {paymentStatusLabels[order.payment?.status] || order.payment?.status || '-'}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('حالة الطلب', 'Order Status')}: {statusLabels[order.status] || order.status}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الإجمالي', 'Total')}: {order.totalAmount} ر.س</Text>

          <View style={styles.itemsWrap}>
            {(order.items || []).map((item: any) => (
              <Text key={item.id} style={[styles.itemLine, { textAlign: isRTL ? 'right' : 'left' }]}>
                {item.product?.name} x {item.quantity}
              </Text>
            ))}
          </View>

          <View style={styles.pickerWrap}>
            <Picker selectedValue={order.status} onValueChange={(status) => setStatus(order.id, status)}>
              {statusOptions.map((status) => (
                <Picker.Item key={status} label={statusLabels[status]} value={status} />
              ))}
            </Picker>
          </View>

          <Pressable onPress={() => load()} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>{tr('حفظ الحالة', 'Save Status')}</Text>
          </Pressable>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  searchRow: {
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
    color: '#0f2f3d',
    fontWeight: '800',
  },
  emptySub: {
    color: '#4a6572',
  },
  item: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 12, gap: 5 },
  title: { fontWeight: '900', color: '#0f2f3d' },
  meta: { color: '#4a6572' },
  itemsWrap: {
    borderWidth: 1,
    borderColor: '#cffafe',
    borderRadius: 10,
    padding: 8,
    gap: 2,
    backgroundColor: '#ecfeff',
  },
  itemLine: {
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
