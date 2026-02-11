import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
import { useAuth } from '@hooks/useAuth';

export const AccountScreen = () => {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <AppHeader title="الحساب" subtitle="إدارة الملف الشخصي" />

      <View style={styles.card}>
        <Text style={styles.label}>الاسم</Text>
        <Text style={styles.value}>{user?.name || '-'}</Text>

        <Text style={styles.label}>البريد الإلكتروني</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>

        <Text style={styles.label}>الدور</Text>
        <Text style={styles.value}>{user?.role || '-'}</Text>
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
});
