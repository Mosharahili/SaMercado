import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Market } from '@app-types/models';
import { useLanguage } from '@hooks/useLanguage';

export const OwnerMarketsScreen = () => {
  const { isRTL, tr } = useLanguage();
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
      Alert.alert(tr('خطأ', 'Error'), error?.message || tr('تعذر اختيار الصورة', 'Unable to pick image'));
    }
  };

  const addOrUpdate = async () => {
    if (!name.trim()) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى إدخال اسم السوق', 'Please enter market name'));
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
        Alert.alert(tr('تم', 'Done'), tr('تم تحديث السوق', 'Market updated'));
      } else {
        await api.post('/markets', {
          name,
          region,
          description,
          ...(imageUrl ? { imageUrl } : {}),
        });
        Alert.alert(tr('تم', 'Done'), tr('تمت إضافة السوق', 'Market added'));
      }

      resetForm();
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('فشل الحفظ', 'Save failed'));
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
      Alert.alert(tr('تم', 'Done'), res.message || tr('تم حذف/أرشفة السوق', 'Market deleted/archived'));
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر الحذف', 'Unable to delete'));
    }
  };

  const toggleActive = async (market: Market) => {
    try {
      await api.put(`/markets/${market.id}`, { isActive: !market.isActive });
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر تحديث الحالة', 'Unable to update status'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{editingId ? tr('تعديل سوق', 'Edit Market') : tr('إضافة سوق', 'Add Market')}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={tr('اسم السوق', 'Market name')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder={tr('المنطقة', 'Region')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder={tr('الوصف', 'Description')} textAlign={isRTL ? 'right' : 'left'} />

        <AppButton label={selectedImage ? tr(`الصورة: ${selectedImage.name}`, `Image: ${selectedImage.name}`) : tr('اختيار صورة السوق', 'Choose market image')} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.preview} resizeMode="cover" /> : null}

        <AppButton label={editingId ? tr('حفظ التعديلات', 'Save Changes') : tr('إضافة السوق', 'Add Market')} onPress={addOrUpdate} loading={saving} />
        {editingId ? <AppButton label={tr('إلغاء التعديل', 'Cancel Editing')} onPress={resetForm} variant="ghost" /> : null}
      </View>

      {markets.map((market) => (
        <View key={market.id} style={styles.item}>
          {market.imageUrl ? (
            <Image source={{ uri: api.resolveAssetUrl(market.imageUrl) }} style={styles.itemImage} resizeMode="cover" />
          ) : null}
          <Text style={[styles.itemTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{market.name}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{market.region}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{market.description || '-'}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الحالة', 'Status')}: {market.isActive ? tr('مفعل', 'Active') : tr('مؤرشف', 'Archived')}</Text>

          <View style={[styles.actionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Pressable onPress={() => startEdit(market)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{tr('تعديل', 'Edit')}</Text>
            </Pressable>
            <Pressable onPress={() => toggleActive(market)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{market.isActive ? tr('أرشفة', 'Archive') : tr('تفعيل', 'Activate')}</Text>
            </Pressable>
            <Pressable onPress={() => remove(market.id)} style={styles.actionDanger}>
              <Text style={styles.actionDangerText}>{tr('حذف', 'Delete')}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 14, gap: 8 },
  title: { fontWeight: '900', color: '#0f2f3d', fontSize: 18 },
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
  itemTitle: { fontWeight: '800', color: '#0f2f3d' },
  itemMeta: { color: '#4a6572' },
  actionRow: {
    marginTop: 6,
    flexDirection: 'row',
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
