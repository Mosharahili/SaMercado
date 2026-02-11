import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api } from '@api/client';

export const OwnerSettingsScreen = () => {
  const [appName, setAppName] = useState('سعودي ميركادو SaudiMercado');
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [deliveryFee, setDeliveryFee] = useState('15');
  const [taxRate, setTaxRate] = useState('0.15');

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get<{ settings: any }>('/settings');
        const settings = response.settings || {};
        if (settings.branding?.appName) setAppName(settings.branding.appName);
        if (settings.branding?.primaryColor) setPrimaryColor(settings.branding.primaryColor);
        if (settings.fees?.deliveryFee !== undefined) setDeliveryFee(String(settings.fees.deliveryFee));
        if (settings.fees?.taxRate !== undefined) setTaxRate(String(settings.fees.taxRate));
      } catch {
        // use local defaults
      }
    })();
  }, []);

  const save = async () => {
    try {
      await api.put('/settings', {
        branding: { appName, primaryColor },
        fees: { deliveryFee: Number(deliveryFee || 0), taxRate: Number(taxRate || 0) },
      });
      Alert.alert('تم', 'تم حفظ الإعدادات');
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل حفظ الإعدادات');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>إعدادات النظام</Text>
        <TextInput style={styles.input} value={appName} onChangeText={setAppName} placeholder="اسم التطبيق" textAlign="right" />
        <TextInput style={styles.input} value={primaryColor} onChangeText={setPrimaryColor} placeholder="اللون الأساسي" textAlign="right" />
        <TextInput style={styles.input} value={deliveryFee} onChangeText={setDeliveryFee} placeholder="رسوم التوصيل" keyboardType="numeric" textAlign="right" />
        <TextInput style={styles.input} value={taxRate} onChangeText={setTaxRate} placeholder="نسبة الضريبة" keyboardType="numeric" textAlign="right" />
        <AppButton label="حفظ الإعدادات" onPress={save} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 16, padding: 14, gap: 8 },
  title: { textAlign: 'right', fontWeight: '900', color: '#14532d', fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
