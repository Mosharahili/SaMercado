import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@hooks/useAuth';
import { api } from '@api/client';
import { PaymentMethod } from '@app-types/models';
import { formatSAR } from '@utils/format';

export const CartScreen = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [contactPhone, setContactPhone] = useState('');
  const [placing, setPlacing] = useState(false);

  const total = subtotal;

  const placeOrder = async () => {
    if (!items.length) {
      Alert.alert('تنبيه', 'السلة فارغة');
      return;
    }

    try {
      setPlacing(true);

      if (!user) {
        Alert.alert('تسجيل الدخول مطلوب', 'يرجى تسجيل الدخول قبل تأكيد الطلب');
        return;
      }

      const normalizedPhone = contactPhone.replace(/[^\d]/g, '');
      if (!/^05\d{8}$/.test(normalizedPhone)) {
        Alert.alert('تنبيه', 'رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05');
        return;
      }

      await api.post('/cart/clear');
      for (const item of items) {
        await api.post('/cart/items', { productId: item.product.id, quantity: item.quantity });
      }

      const response = await api.post<{
        order?: { orderNumber: string };
        orders?: Array<{ orderNumber: string }>;
        paymentResults?: Array<{ status: string; redirectUrl?: string; message?: string; failureReason?: string }>;
      }>('/orders/checkout', {
        paymentMethod,
        contactPhone: normalizedPhone,
      });

      clearCart();
      const orderNumbers = (response.orders || []).map((order) => order.orderNumber).filter(Boolean);
      const paymentResult = response.paymentResults?.[0];

      if (orderNumbers.length > 1) {
        Alert.alert('تم تأكيد الطلب', `تم إنشاء ${orderNumbers.length} طلبات: ${orderNumbers.join(' - ')}`);
      } else if (response.order?.orderNumber) {
        Alert.alert('تم تأكيد الطلب', `رقم الطلب: ${response.order.orderNumber}`);
      } else {
        Alert.alert('تم تأكيد الطلب', 'تم إرسال طلبك بنجاح');
      }

      if (paymentMethod !== 'CASH_ON_DELIVERY') {
        if (paymentResult?.status === 'FAILED') {
          Alert.alert('تنبيه الدفع', paymentResult.failureReason || 'تعذر بدء عملية الدفع الإلكتروني حالياً');
        } else if (paymentResult?.redirectUrl) {
          Alert.alert('متابعة الدفع', `رابط إكمال الدفع: ${paymentResult.redirectUrl}`);
        } else if (paymentResult?.message) {
          Alert.alert('تنبيه الدفع', paymentResult.message);
        }
      }
    } catch (error: any) {
      Alert.alert('فشل الإتمام', error?.response?.data?.error || error.message || 'تعذر إتمام الطلب');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="السلة" subtitle="إدارة الطلب والدفع" />

      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <Text style={styles.itemName}>{item.product.name}</Text>
          <Text style={styles.itemMeta}>{formatSAR(Number(item.product.price))} / {item.product.unit}</Text>

          <View style={styles.qtyRow}>
            <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
            <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn}>
              <Text style={styles.removeText}>حذف</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLine}>المجموع الفرعي: {formatSAR(subtotal)}</Text>
        <Text style={styles.totalLine}>الإجمالي: {formatSAR(total)}</Text>

        <Text style={styles.paymentTitle}>رقم الجوال</Text>
        <TextInput
          style={styles.phoneInput}
          value={contactPhone}
          onChangeText={(text) => setContactPhone(text.replace(/[^\d]/g, '').slice(0, 10))}
          keyboardType="phone-pad"
          placeholder="05********"
          placeholderTextColor="#64748b"
          textAlign="right"
          maxLength={10}
        />

        <Text style={styles.paymentTitle}>طريقة الدفع</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={paymentMethod} onValueChange={setPaymentMethod}>
            <Picker.Item label="Mada" value="MADA" />
            <Picker.Item label="Apple Pay" value="APPLE_PAY" />
            <Picker.Item label="الدفع عند الاستلام" value="CASH_ON_DELIVERY" />
          </Picker>
        </View>

        <AppButton label="تأكيد الطلب" onPress={placeOrder} loading={placing} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  itemName: {
    textAlign: 'right',
    fontWeight: '800',
    color: '#14532d',
  },
  itemMeta: {
    textAlign: 'right',
    color: '#4b5563',
  },
  qtyRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontWeight: '800',
    color: '#166534',
  },
  qtyText: {
    fontWeight: '700',
    color: '#14532d',
  },
  removeBtn: {
    marginRight: 'auto',
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  summaryLine: {
    textAlign: 'right',
    color: '#14532d',
  },
  totalLine: {
    textAlign: 'right',
    color: '#052e16',
    fontWeight: '900',
    fontSize: 18,
  },
  paymentTitle: {
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '700',
    color: '#14532d',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'right',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdf4',
  },
});
