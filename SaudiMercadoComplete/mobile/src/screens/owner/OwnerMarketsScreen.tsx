import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api } from '@api/client';

export const OwnerMarketsScreen = () => {
  const [markets, setMarkets] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('الرياض');
  const [description, setDescription] = useState('');

  const load = async () => {
    try {
      const res = await api.get<{ markets: any[] }>('/markets');
      setMarkets(res.markets || []);
    } catch {
      setMarkets([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    try {
      await api.post('/markets', {
        name,
        region,
        description,
      });
      setName('');
      setDescription('');
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل الحفظ');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>إضافة سوق</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="اسم السوق" textAlign="right" />
        <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="المنطقة" textAlign="right" />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="الوصف" textAlign="right" />
        <AppButton label="حفظ" onPress={add} />
      </View>

      {markets.map((market) => (
        <View key={market.id} style={styles.item}>
          <Text style={styles.itemTitle}>{market.name}</Text>
          <Text style={styles.itemMeta}>{market.region}</Text>
        </View>
      ))}
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
  item: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 12 },
  itemTitle: { textAlign: 'right', fontWeight: '800', color: '#14532d' },
  itemMeta: { textAlign: 'right', color: '#4b5563' },
});
