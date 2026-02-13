import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';

export const OwnerSettingsScreen = () => {
  const { isRTL, tr } = useLanguage();
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
      Alert.alert(tr('تم', 'Done'), tr('تم حفظ الإعدادات', 'Settings saved'));
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('فشل حفظ الإعدادات', 'Failed to save settings'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('إعدادات النظام', 'System Settings')}</Text>
        <TextInput style={styles.input} value={appName} onChangeText={setAppName} placeholder={tr('اسم التطبيق', 'App name')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={primaryColor} onChangeText={setPrimaryColor} placeholder={tr('اللون الأساسي', 'Primary color')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={deliveryFee} onChangeText={setDeliveryFee} placeholder={tr('رسوم التوصيل', 'Delivery fee')} keyboardType="numeric" textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={taxRate} onChangeText={setTaxRate} placeholder={tr('نسبة الضريبة', 'Tax rate')} keyboardType="numeric" textAlign={isRTL ? 'right' : 'left'} />
        <AppButton label={tr('حفظ الإعدادات', 'Save Settings')} onPress={save} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 16, padding: 14, gap: 8 },
  title: { fontWeight: '900', color: '#14532d', fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
