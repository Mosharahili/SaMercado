import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Banner } from '@app-types/models';
import { useLanguage } from '@hooks/useLanguage';

export const BannerManagerScreen = () => {
  const { isRTL, tr } = useLanguage();
  const defaultCtaText = tr('تسوق الآن', 'Shop Now');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('HOME_HERO');
  const [ctaText, setCtaText] = useState(defaultCtaText);
  const [actionType, setActionType] = useState('NONE');
  const [actionValue, setActionValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<UploadFile | null>(null);
  const [saving, setSaving] = useState(false);
  const placements = [
    { label: tr('الرئيسية (الهيدر) 1080x480', 'Home (Hero) 1080x480'), value: 'HOME_HERO' },
    { label: tr('الرئيسية (منتصف) 1080x300', 'Home (Middle) 1080x300'), value: 'HOME_MID' },
    { label: tr('الرئيسية (أسفل الصفحة)', 'Home (Bottom)'), value: 'HOME_BOTTOM' },
    { label: tr('المنتجات (أعلى الصفحة)', 'Products (Top)'), value: 'PRODUCT_TOP' },
    { label: tr('المنتجات (داخل القائمة) 1080x250', 'Products (Inline) 1080x250'), value: 'PRODUCT_INLINE' },
  ];

  const actionTypes = [
    { label: tr('بدون إجراء', 'No Action'), value: 'NONE' },
    { label: tr('فتح منتج', 'Open Product'), value: 'PRODUCT' },
    { label: tr('فتح سوق', 'Open Market'), value: 'MARKET' },
    { label: tr('فتح تصنيف', 'Open Category'), value: 'CATEGORY' },
    { label: tr('رابط خارجي', 'External Link'), value: 'EXTERNAL_LINK' },
  ];

  const placementLabels: Record<string, string> = {
    HOME_HERO: tr('الرئيسية (الهيدر)', 'Home (Hero)'),
    HOME_MID: tr('الرئيسية (منتصف)', 'Home (Middle)'),
    HOME_BOTTOM: tr('الرئيسية (أسفل)', 'Home (Bottom)'),
    PRODUCT_TOP: tr('المنتجات (أعلى)', 'Products (Top)'),
    PRODUCT_INLINE: tr('المنتجات (داخل القائمة)', 'Products (Inline)'),
  };

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
    setCtaText(defaultCtaText);
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
      Alert.alert(tr('خطأ', 'Error'), error?.message || tr('تعذر اختيار الصورة', 'Unable to pick image'));
    }
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى إدخال عنوان البوستر', 'Please enter banner title'));
      return;
    }

    if (!editingId && !selectedImage) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى اختيار صورة البوستر', 'Please select banner image'));
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

      Alert.alert(tr('تم', 'Done'), editingId ? tr('تم تحديث البوستر', 'Banner updated') : tr('تم إنشاء البوستر', 'Banner created'));
      resetForm();
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('فشل الحفظ', 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title || '');
    setDescription(banner.description || '');
    setPlacement(banner.placement || 'HOME_HERO');
    setCtaText(banner.ctaText || defaultCtaText);
    setActionType(banner.actionType || 'NONE');
    setActionValue(banner.actionValue || '');
    setSelectedImage(null);
  };

  const remove = async (id: string) => {
    try {
      await api.del(`/banners/${id}`);
      Alert.alert(tr('تم', 'Done'), tr('تم حذف البوستر', 'Banner deleted'));
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر الحذف', 'Unable to delete'));
    }
  };

  const toggleEnabled = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner.id}`, { isEnabled: !banner.isEnabled });
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر تحديث الحالة', 'Unable to update status'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{editingId ? tr('تعديل بوستر', 'Edit Banner') : tr('إضافة بوستر جديد', 'Add New Banner')}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={tr('العنوان', 'Title')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder={tr('الوصف', 'Description')} textAlign={isRTL ? 'right' : 'left'} />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={placement} onValueChange={setPlacement}>
            {placements.map((placementOption) => (
              <Picker.Item key={placementOption.value} label={placementOption.label} value={placementOption.value} />
            ))}
          </Picker>
        </View>

        <TextInput style={styles.input} value={ctaText} onChangeText={setCtaText} placeholder={tr('نص زر الإجراء', 'CTA button text')} textAlign={isRTL ? 'right' : 'left'} />
        <View style={styles.pickerWrap}>
          <Picker selectedValue={actionType} onValueChange={setActionType}>
            {actionTypes.map((action) => (
              <Picker.Item key={action.value} label={action.label} value={action.value} />
            ))}
          </Picker>
        </View>
        <TextInput style={styles.input} value={actionValue} onChangeText={setActionValue} placeholder={tr('قيمة الإجراء', 'Action value')} textAlign={isRTL ? 'right' : 'left'} />

        <AppButton label={selectedImage ? tr(`الصورة: ${selectedImage.name}`, `Image: ${selectedImage.name}`) : tr('اختيار صورة البوستر', 'Choose banner image')} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.selectedPreview} resizeMode="cover" /> : null}

        <AppButton label={editingId ? tr('حفظ التعديلات', 'Save Changes') : tr('حفظ البوستر', 'Save Banner')} onPress={save} loading={saving} />
        {editingId ? <AppButton label={tr('إلغاء التعديل', 'Cancel Editing')} onPress={resetForm} variant="ghost" /> : null}
      </View>

      {banners.map((banner) => (
        <View key={banner.id} style={styles.item}>
          {banner.imageUrl ? (
            <Image source={{ uri: api.resolveAssetUrl(banner.imageUrl) }} style={styles.itemImage} resizeMode="cover" />
          ) : null}
          <Text style={[styles.itemTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{banner.title}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{placementLabels[banner.placement] || banner.placement}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{banner.description || '-'}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الحالة', 'Status')}: {banner.isEnabled ? tr('مفعل', 'Active') : tr('متوقف', 'Disabled')}</Text>

          <View style={[styles.actionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Pressable onPress={() => startEdit(banner)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{tr('تعديل', 'Edit')}</Text>
            </Pressable>
            <Pressable onPress={() => toggleEnabled(banner)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{banner.isEnabled ? tr('إيقاف', 'Disable') : tr('تفعيل', 'Enable')}</Text>
            </Pressable>
            <Pressable onPress={() => remove(banner.id)} style={styles.actionDanger}>
              <Text style={styles.actionDangerText}>{tr('حذف', 'Delete')}</Text>
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
  title: { fontWeight: '900', color: '#0f2f3d', fontSize: 18 },
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
