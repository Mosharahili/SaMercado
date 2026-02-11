import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
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

export const BannerManagerScreen = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('HOME_HERO');
  const [ctaText, setCtaText] = useState('تسوق الآن');
  const [actionType, setActionType] = useState('NONE');
  const [actionValue, setActionValue] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [selectedImage, setSelectedImage] = useState<UploadFile | null>(null);
  const [saving, setSaving] = useState(false);

  const guessMimeFromFileName = (name: string) => {
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.gif')) return 'image/gif';
    if (name.endsWith('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const rawName = asset.fileName || asset.uri.split('/').pop() || `banner-${Date.now()}.jpg`;
      const name = rawName.replace(/\s+/g, '_');

      setSelectedImage({
        uri: asset.uri,
        name,
        type: asset.mimeType || guessMimeFromFileName(name.toLowerCase()),
      });
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر اختيار الصورة');
    }
  };

  const load = async () => {
    try {
      const response = await api.get<{ banners: Banner[] }>('/banners');
      setBanners(response.banners || []);
    } catch (_error) {
      setBanners([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createBanner = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان البوستر');
      return;
    }

    if (!selectedImage) {
      Alert.alert('تنبيه', 'يرجى اختيار صورة البوستر');
      return;
    }

    setSaving(true);
    try {
      const created = await api.post<{ banner: Banner }>('/banners', {
        title,
        description,
        placement,
        ctaText,
        actionType,
        actionValue,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
      });
      await api.upload(`/banners/${created.banner.id}/image`, selectedImage);
      Alert.alert('تم', 'تم إنشاء البوستر');
      setTitle('');
      setDescription('');
      setActionValue('');
      setStartsAt('');
      setEndsAt('');
      setSelectedImage(null);
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>إضافة بوستر جديد</Text>
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
        <TextInput style={styles.input} value={actionType} onChangeText={setActionType} placeholder="نوع الإجراء" textAlign="right" />
        <TextInput style={styles.input} value={actionValue} onChangeText={setActionValue} placeholder="قيمة الإجراء" textAlign="right" />
        <TextInput style={styles.input} value={startsAt} onChangeText={setStartsAt} placeholder="Start date ISO" textAlign="right" />
        <TextInput style={styles.input} value={endsAt} onChangeText={setEndsAt} placeholder="End date ISO" textAlign="right" />

        <AppButton label={selectedImage ? `الصورة: ${selectedImage.name}` : 'اختيار صورة البوستر'} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.selectedPreview} /> : null}

        <AppButton label="حفظ البوستر" onPress={createBanner} loading={saving} />
      </View>

      {banners.map((banner) => (
        <View key={banner.id} style={styles.item}>
          {banner.imageUrl ? <Image source={{ uri: api.resolveAssetUrl(banner.imageUrl) }} style={styles.itemImage} /> : null}
          <Text style={styles.itemTitle}>{banner.title}</Text>
          <Text style={styles.itemMeta}>{banner.placement}</Text>
          <Text style={styles.itemMeta}>{banner.description || '-'}</Text>
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
  title: { textAlign: 'right', fontWeight: '900', color: '#14532d', fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdf4',
  },
  item: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12,
    padding: 12,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#dcfce7',
  },
  selectedPreview: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
  },
  itemTitle: { textAlign: 'right', fontWeight: '800', color: '#14532d' },
  itemMeta: { textAlign: 'right', color: '#4b5563' },
});
