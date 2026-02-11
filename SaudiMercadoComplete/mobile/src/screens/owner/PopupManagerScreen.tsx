import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Popup } from '@app-types/models';

export const PopupManagerScreen = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('ALL_USERS');
  const [trigger, setTrigger] = useState('APP_OPEN');
  const [primaryCtaText, setPrimaryCtaText] = useState('تصفح المنتج');
  const [secondaryCtaText, setSecondaryCtaText] = useState('لاحقًا');
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
      const rawName = asset.fileName || asset.uri.split('/').pop() || `popup-${Date.now()}.jpg`;
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
      const response = await api.get<{ popups: Popup[] }>('/popups');
      setPopups(response.popups || []);
    } catch {
      setPopups([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPopup = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان النافذة');
      return;
    }

    if (!selectedImage) {
      Alert.alert('تنبيه', 'يرجى اختيار صورة للنافذة المنبثقة');
      return;
    }

    setSaving(true);
    try {
      const created = await api.post<{ popup: Popup }>('/popups', {
        title,
        message,
        targetType,
        trigger,
        primaryCtaText,
        secondaryCtaText,
        isDismissible: true,
      });
      await api.upload(`/popups/${created.popup.id}/image`, selectedImage);
      Alert.alert('تم', 'تم إنشاء النافذة المنبثقة');
      setTitle('');
      setMessage('');
      setSelectedImage(null);
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل إنشاء النافذة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>Popup Manager</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="العنوان" textAlign="right" />
        <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="الرسالة" textAlign="right" />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={targetType} onValueChange={setTargetType}>
            <Picker.Item label="All users" value="ALL_USERS" />
            <Picker.Item label="Only logged-in users" value="LOGGED_IN" />
            <Picker.Item label="Only new users" value="NEW_USERS" />
            <Picker.Item label="Specific markets" value="SPECIFIC_MARKETS" />
            <Picker.Item label="Specific categories" value="SPECIFIC_CATEGORIES" />
          </Picker>
        </View>

        <View style={styles.pickerWrap}>
          <Picker selectedValue={trigger} onValueChange={setTrigger}>
            <Picker.Item label="App open" value="APP_OPEN" />
            <Picker.Item label="Page open" value="PAGE_OPEN" />
          </Picker>
        </View>

        <TextInput style={styles.input} value={primaryCtaText} onChangeText={setPrimaryCtaText} placeholder="Primary CTA" textAlign="right" />
        <TextInput style={styles.input} value={secondaryCtaText} onChangeText={setSecondaryCtaText} placeholder="Secondary CTA" textAlign="right" />

        <AppButton label={selectedImage ? `الصورة: ${selectedImage.name}` : 'اختيار صورة النافذة'} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.selectedPreview} /> : null}

        <AppButton label="حفظ النافذة" onPress={createPopup} loading={saving} />
      </View>

      {popups.map((popup) => (
        <View key={popup.id} style={styles.item}>
          {popup.imageUrl ? <Image source={{ uri: api.resolveAssetUrl(popup.imageUrl) }} style={styles.itemImage} /> : null}
          <Text style={styles.itemTitle}>{popup.title}</Text>
          <Text style={styles.itemMeta}>{popup.message || '-'}</Text>
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
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#dcfce7',
  },
  selectedPreview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
  },
  itemTitle: { textAlign: 'right', fontWeight: '800', color: '#14532d' },
  itemMeta: { textAlign: 'right', color: '#4b5563' },
});
