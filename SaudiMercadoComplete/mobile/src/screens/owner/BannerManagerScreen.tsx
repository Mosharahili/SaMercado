import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Banner } from '@app-types/models';

const placements = [
  { label: 'Home Hero 1080x480', value: 'HOME_HERO' },
  { label: 'Home Mid 1080x300', value: 'HOME_MID' },
  { label: 'Home Bottom CTA', value: 'HOME_BOTTOM' },
  { label: 'Product Top', value: 'PRODUCT_TOP' },
  { label: 'Product Inline 1080x250', value: 'PRODUCT_INLINE' },
];

const actionTypes = [
  { label: 'بدون إجراء', value: 'NONE' },
  { label: 'فتح منتج', value: 'PRODUCT' },
  { label: 'فتح سوق', value: 'MARKET' },
  { label: 'فتح تصنيف', value: 'CATEGORY' },
  { label: 'رابط خارجي', value: 'EXTERNAL_LINK' },
];

export const BannerManagerScreen = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('HOME_HERO');
  const [ctaText, setCtaText] = useState('تسوق الآن');
  const [actionType, setActionType] = useState('NONE');
  const [actionValue, setActionValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<UploadFile | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const response = await api.get<{ banners: Banner[] }>('/banners');
      setBanners(response.banners || []);
    } catch {
      setBanners([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPlacement('HOME_HERO');
    setCtaText('تسوق الآن');
    setActionType('NONE');
    setActionValue('');
    setSelectedImage(null);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.9 });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const rawName = asset.fileName || asset.uri.split('/').pop() || `banner-${Date.now()}.jpg`;
      const name = rawName.replace(/\s+/g, '_');
      setSelectedImage({ uri: asset.uri, name, type: asset.mimeType || 'image/jpeg' });
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر اختيار الصورة');
    }
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان البوستر');
      return;
    }

    if (!editingId && !selectedImage) {
      Alert.alert('تنبيه', 'يرجى اختيار صورة البوستر');
      return;
    }

    setSaving(true);
    try {
      let id = editingId;
      if (editingId) {
        await api.put(`/banners/${editingId}`, {
          title,
          description,
          placement,
          ctaText,
          actionType,
          actionValue,
        });
      } else {
        const created = await api.post<{ banner: Banner }>('/banners', {
          title,
          description,
          placement,
          ctaText,
          actionType,
          actionValue,
        });
        id = created.banner.id;
      }

      if (id && selectedImage) {
        await api.upload(`/banners/${id}/image`, selectedImage);
      }

      Alert.alert('تم', editingId ? 'تم تحديث البوستر' : 'تم إنشاء البوستر');
      resetForm();
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title || '');
    setDescription(banner.description || '');
    setPlacement(banner.placement || 'HOME_HERO');
    setCtaText(banner.ctaText || 'تسوق الآن');
    setActionType(banner.actionType || 'NONE');
    setActionValue(banner.actionValue || '');
    setSelectedImage(null);
  };

  const remove = async (id: string) => {
    try {
      await api.del(`/banners/${id}`);
      Alert.alert('تم', 'تم حذف البوستر');
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر الحذف');
    }
  };

  const toggleEnabled = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner.id}`, { isEnabled: !banner.isEnabled });
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر تحديث الحالة');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>{editingId ? 'تعديل بوستر' : 'إضافة بوستر جديد'}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="العنوان" textAlign="right" />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="الوصف" textAlign="right" />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={placement} onValueChange={setPlacement}>
            {placements.map((placementOption) => (
              <Picker.Item key={placementOption.value} label={placementOption.label} value={placementOption.value} />
            ))}
          </Picker>
        </View>

        <TextInput style={styles.input} value={ctaText} onChangeText={setCtaText} placeholder="نص زر CTA" textAlign="right" />
        <View style={styles.pickerWrap}>
          <Picker selectedValue={actionType} onValueChange={setActionType}>
            {actionTypes.map((action) => (
              <Picker.Item key={action.value} label={action.label} value={action.value} />
            ))}
          </Picker>
        </View>
        <TextInput style={styles.input} value={actionValue} onChangeText={setActionValue} placeholder="قيمة الإجراء" textAlign="right" />

        <AppButton label={selectedImage ? `الصورة: ${selectedImage.name}` : 'اختيار صورة البوستر'} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.selectedPreview} /> : null}

        <AppButton label={editingId ? 'حفظ التعديلات' : 'حفظ البوستر'} onPress={save} loading={saving} />
        {editingId ? <AppButton label="إلغاء التعديل" onPress={resetForm} variant="ghost" /> : null}
      </View>

      {banners.map((banner) => (
        <View key={banner.id} style={styles.item}>
          {banner.imageUrl ? <Image source={{ uri: api.resolveAssetUrl(banner.imageUrl) }} style={styles.itemImage} /> : null}
          <Text style={styles.itemTitle}>{banner.title}</Text>
          <Text style={styles.itemMeta}>{banner.placement}</Text>
          <Text style={styles.itemMeta}>{banner.description || '-'}</Text>
          <Text style={styles.itemMeta}>الحالة: {banner.isEnabled ? 'مفعل' : 'متوقف'}</Text>

          <View style={styles.actionRow}>
            <Pressable onPress={() => startEdit(banner)} style={styles.actionBtn}>
              <Text style={styles.actionText}>تعديل</Text>
            </Pressable>
            <Pressable onPress={() => toggleEnabled(banner)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{banner.isEnabled ? 'إيقاف' : 'تفعيل'}</Text>
            </Pressable>
            <Pressable onPress={() => remove(banner.id)} style={styles.actionDanger}>
              <Text style={styles.actionDangerText}>حذف</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  title: { textAlign: 'right', fontWeight: '900', color: '#0f2f3d', fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdfa',
  },
  item: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#cffafe',
  },
  selectedPreview: {
    width: '100%',
    height: 140,
    borderRadius: 10,
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
