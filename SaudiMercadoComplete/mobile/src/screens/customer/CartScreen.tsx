import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { api } from '@api/client';
import { PaymentMethod } from '@app-types/models';
import { formatSAR } from '@utils/format';

export const CartScreen = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const { isRTL, tr } = useLanguage();
  const visualPad = React.useCallback((value: string) => (isRTL ? `\u200F\u061C\u00A0\u00A0${value}` : value), [isRTL]);
  const textDirectionStyle = {
    textAlign: isRTL ? 'right' : 'left',
    width: '100%',
  } as const;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [contactPhone, setContactPhone] = useState('');
  const [placing, setPlacing] = useState(false);

  const total = subtotal;

  const placeOrder = async () => {
    if (!items.length) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('السلة فارغة', 'Your cart is empty'));
      return;
    }

    try {
      setPlacing(true);

      if (!user) {
        Alert.alert(tr('تسجيل الدخول مطلوب', 'Sign in required'), tr('يرجى تسجيل الدخول قبل تأكيد الطلب', 'Please sign in before confirming the order'));
        return;
      }

      const normalizedPhone = contactPhone.replace(/[^\d]/g, '');
      if (!/^05\d{8}$/.test(normalizedPhone)) {
        Alert.alert(tr('تنبيه', 'Notice'), tr('رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05', 'Phone number must be 10 digits and start with 05'));
        return;
      }

      if (paymentMethod !== 'CASH_ON_DELIVERY') {
        Alert.alert(tr('تنبيه', 'Notice'), tr('الدفع عند الاستلام هو المتاح حاليًا. سيتم تفعيل Mada وApple Pay قريبًا.', 'Cash on delivery is currently available. Mada and Apple Pay will be enabled soon.'));
        return;
      }

      await api.del('/cart/clear');
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
        Alert.alert(tr('تم تأكيد الطلب', 'Order confirmed'), tr(`تم إنشاء ${orderNumbers.length} طلبات: ${orderNumbers.join(' - ')}`, `${orderNumbers.length} orders were created: ${orderNumbers.join(' - ')}`));
      } else if (response.order?.orderNumber) {
        Alert.alert(tr('تم تأكيد الطلب', 'Order confirmed'), tr(`رقم الطلب: ${response.order.orderNumber}`, `Order number: ${response.order.orderNumber}`));
      } else {
        Alert.alert(tr('تم تأكيد الطلب', 'Order confirmed'), tr('تم إرسال طلبك بنجاح', 'Your order was sent successfully'));
      }

      if (paymentMethod !== 'CASH_ON_DELIVERY') {
        if (paymentResult?.status === 'FAILED') {
          Alert.alert(tr('تنبيه الدفع', 'Payment notice'), paymentResult.failureReason || tr('تعذر بدء عملية الدفع الإلكتروني حالياً', 'Unable to start online payment right now'));
        } else if (paymentResult?.redirectUrl) {
          Alert.alert(tr('متابعة الدفع', 'Continue payment'), tr(`رابط إكمال الدفع: ${paymentResult.redirectUrl}`, `Payment completion URL: ${paymentResult.redirectUrl}`));
        } else if (paymentResult?.message) {
          Alert.alert(tr('تنبيه الدفع', 'Payment notice'), paymentResult.message);
        }
      }
    } catch (error: any) {
      Alert.alert(tr('فشل الإتمام', 'Checkout failed'), error?.response?.data?.error || error.message || tr('تعذر إتمام الطلب', 'Unable to complete your order'));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title={tr('السلة', 'Cart')} subtitle={tr('إدارة الطلب والدفع', 'Order and payment')} />

      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <Text style={[styles.itemName, textDirectionStyle]}>{visualPad(item.product.name)}</Text>
          <Text style={[styles.itemMeta, textDirectionStyle]}>{formatSAR(Number(item.product.price))} / {item.product.unit}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.qtyRow}
          >
            <Pressable onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
            <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn}>
              <Text style={[styles.removeText, { }]}>{tr('حذف', 'Remove')}</Text>
            </Pressable>
          </ScrollView>
        </View>
      ))}

      <View style={styles.summaryCard}>
        <Text style={[styles.summaryLine, textDirectionStyle]}>{tr('المجموع الفرعي', 'Subtotal')}: {formatSAR(subtotal)}</Text>
        <Text style={[styles.totalLine, textDirectionStyle]}>{tr('الإجمالي', 'Total')}: {formatSAR(total)}</Text>

        <Text style={[styles.paymentTitle, textDirectionStyle]}>{tr('رقم الجوال', 'Phone number')}</Text>
        <TextInput
          style={[styles.phoneInput, { }]}
          value={contactPhone}
          onChangeText={(text) => setContactPhone(text.replace(/[^\d]/g, '').slice(0, 10))}
          keyboardType="phone-pad"
          placeholder="05********"
          placeholderTextColor="#64748b"
          textAlign={isRTL ? 'right' : 'left'}
          maxLength={10}
        />

        <Text style={[styles.paymentTitle, textDirectionStyle]}>{tr('طريقة الدفع', 'Payment method')}</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={paymentMethod} onValueChange={setPaymentMethod}>
            <Picker.Item label={tr('Mada (قريبًا)', 'Mada (Soon)')} value="MADA" enabled={false} />
            <Picker.Item label={tr('Apple Pay (قريبًا)', 'Apple Pay (Soon)')} value="APPLE_PAY" enabled={false} />
            <Picker.Item label={tr('الدفع عند الاستلام', 'Cash on Delivery')} value="CASH_ON_DELIVERY" />
          </Picker>
        </View>
        <Text style={[styles.paymentHint, textDirectionStyle]}>{tr('المتاح حاليًا: الدفع عند الاستلام فقط', 'Currently available: Cash on Delivery only')}</Text>

        <AppButton label={tr('تأكيد الطلب', 'Confirm Order')} onPress={placeOrder} loading={placing} />
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
    fontWeight: '800',
    color: '#14532d',
  },
  itemMeta: {
    color: '#4b5563',
  },
  qtyRow: {
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
    marginStart: 'auto',
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
    color: '#14532d',
  },
  totalLine: {
    color: '#052e16',
    fontWeight: '900',
    fontSize: 18,
  },
  paymentTitle: {
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
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdf4',
  },
  paymentHint: {
    color: '#0f766e',
    fontSize: 12,
    marginTop: -2,
  },
});
