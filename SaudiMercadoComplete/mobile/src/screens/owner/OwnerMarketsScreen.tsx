import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Market } from '@app-types/models';

export const OwnerMarketsScreen = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('الرياض');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<UploadFile | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get<{ markets: Market[] }>('/markets?includeInactive=true');
      setMarkets(res.markets || []);
    } catch {
      setMarkets([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRegion('الرياض');
    setDescription('');
    setSelectedImage(null);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.9 });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const rawName = asset.fileName || asset.uri.split('/').pop() || `market-${Date.now()}.jpg`;
      const name = rawName.replace(/\s+/g, '_');
      setSelectedImage({
        uri: asset.uri,
        name,
        type: asset.mimeType || 'image/jpeg',
      });
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر اختيار الصورة');
    }
  };

  const addOrUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم السوق');
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        const uploadRes = await api.upload<{ file: { url: string } }>('/upload/image', selectedImage);
        imageUrl = uploadRes.file?.url;
      }

      if (editingId) {
        await api.put(`/markets/${editingId}`, {
          name,
          region,
          description,
          ...(imageUrl ? { imageUrl } : {}),
        });
        Alert.alert('تم', 'تم تحديث السوق');
      } else {
        await api.post('/markets', {
          name,
          region,
          description,
          ...(imageUrl ? { imageUrl } : {}),
        });
        Alert.alert('تم', 'تمت إضافة السوق');
      }

      resetForm();
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (market: Market) => {
    setEditingId(market.id);
    setName(market.name || '');
    setRegion(market.region || 'الرياض');
    setDescription(market.description || '');
    setSelectedImage(null);
  };

  const remove = async (id: string) => {
    try {
      const res = await api.del<{ message: string }>(`/markets/${id}`);
      Alert.alert('تم', res.message || 'تم حذف/أرشفة السوق');
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر الحذف');
    }
  };

  const toggleActive = async (market: Market) => {
    try {
      await api.put(`/markets/${market.id}`, { isActive: !market.isActive });
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر تحديث الحالة');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>{editingId ? 'تعديل سوق' : 'إضافة سوق'}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="اسم السوق" textAlign="right" />
        <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="المنطقة" textAlign="right" />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="الوصف" textAlign="right" />

        <AppButton label={selectedImage ? `الصورة: ${selectedImage.name}` : 'اختيار صورة السوق'} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.preview} resizeMode="cover" /> : null}

        <AppButton label={editingId ? 'حفظ التعديلات' : 'إضافة السوق'} onPress={addOrUpdate} loading={saving} />
        {editingId ? <AppButton label="إلغاء التعديل" onPress={resetForm} variant="ghost" /> : null}
      </View>

      {markets.map((market) => (
        <View key={market.id} style={styles.item}>
          {market.imageUrl ? (
            <Image source={{ uri: api.resolveAssetUrl(market.imageUrl) }} style={styles.itemImage} resizeMode="cover" />
          ) : null}
          <Text style={styles.itemTitle}>{market.name}</Text>
          <Text style={styles.itemMeta}>{market.region}</Text>
          <Text style={styles.itemMeta}>{market.description || '-'}</Text>
          <Text style={styles.itemMeta}>الحالة: {market.isActive ? 'مفعل' : 'مؤرشف'}</Text>

          <View style={styles.actionRow}>
            <Pressable onPress={() => startEdit(market)} style={styles.actionBtn}>
              <Text style={styles.actionText}>تعديل</Text>
            </Pressable>
            <Pressable onPress={() => toggleActive(market)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{market.isActive ? 'أرشفة' : 'تفعيل'}</Text>
            </Pressable>
            <Pressable onPress={() => remove(market.id)} style={styles.actionDanger}>
              <Text style={styles.actionDangerText}>حذف</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 14, gap: 8 },
  title: { textAlign: 'right', fontWeight: '900', color: '#0f2f3d', fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#cffafe',
  },
  item: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 12, padding: 12, gap: 4 },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#cffafe',
  },
  itemTitle: { textAlign: 'right', fontWeight: '800', color: '#0f2f3d' },
  itemMeta: { textAlign: 'right', color: '#4a6572' },
  actionRow: {
    marginTop: 6,
    flexDirection: 'row-reverse',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#ecfeff',
  },
  actionText: {
    color: '#0f766e',
    fontWeight: '700',
  },
  actionDanger: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
  },
  actionDangerText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
