import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { api } from '@api/client';
import { Order } from '@app-types/models';

export const AccountScreen = () => {
  const { user, logout } = useAuth();
  const { isRTL, t } = useLanguage();
  const visualPad = React.useCallback((value: string) => (isRTL ? `\u200F\u061C\u00A0\u00A0${value}` : value), [isRTL]);
  const textDirectionStyle = {
    textAlign: isRTL ? 'right' : 'left',
    width: '100%',
  } as const;
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
      <AppHeader title={t('account.title')} subtitle={t('account.subtitle')} />

      <View style={styles.card}>
        <Text style={[styles.label, textDirectionStyle]}>{t('account.name')}</Text>
        <Text style={[styles.value, textDirectionStyle]}>{user?.name ? visualPad(user.name) : '-'}</Text>

        <Text style={[styles.label, textDirectionStyle]}>{t('account.email')}</Text>
        <Text style={[styles.value, textDirectionStyle]}>{user?.email || '-'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.label, textDirectionStyle]}>{t('account.notifications')}</Text>
        <Pressable style={styles.noticeItem}>
          <Text style={[styles.noticeText, textDirectionStyle]}>{t('account.orderUpdates')}</Text>
        </Pressable>
        <Pressable style={styles.noticeItem}>
          <Text style={[styles.noticeText, textDirectionStyle]}>{t('account.promotions')}</Text>
        </Pressable>
      </View>

      {user?.role === 'CUSTOMER' ? (
        <View style={styles.card}>
          <Text style={[styles.label, textDirectionStyle]}>{t('account.myOrders')}</Text>
          {!orders.length ? <Text style={[styles.value, textDirectionStyle]}>{t('account.noOrders')}</Text> : null}
          {orders.slice(0, 8).map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <Text style={[styles.orderLine, textDirectionStyle]}>#{visualPad(order.orderNumber)}</Text>
              <Text style={[styles.orderLine, textDirectionStyle]}>
                {t('account.status')}: {order.status}
              </Text>
              <Text style={[styles.orderLine, textDirectionStyle]}>
                {t('account.total')}: {order.totalAmount} ر.س
              </Text>
            </View>
          ))}
          <AppButton label={t('account.refreshOrders')} onPress={loadOrders} variant="ghost" />
        </View>
      ) : null}

      <AppButton label={t('account.logout')} onPress={logout} />
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
    color: '#166534',
    fontWeight: '700',
  },
  value: {
    color: '#052e16',
    fontSize: 16,
  },
  noticeItem: {
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    padding: 10,
  },
  noticeText: {
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
    color: '#14532d',
    fontWeight: '600',
  },
});
