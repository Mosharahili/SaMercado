import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Popup } from '@app-types/models';

export const PopupManagerScreen = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('ALL_USERS');
  const [trigger, setTrigger] = useState('APP_OPEN');
  const [primaryCtaText, setPrimaryCtaText] = useState('تصفح المنتج');
  const [secondaryCtaText, setSecondaryCtaText] = useState('لاحقًا');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const [selectedImage, setSelectedImage] = useState<UploadFile | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.9 });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const rawName = asset.fileName || asset.uri.split('/').pop() || `popup-${Date.now()}.jpg`;
      const name = rawName.replace(/\s+/g, '_');
      setSelectedImage({ uri: asset.uri, name, type: asset.mimeType || 'image/jpeg' });
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

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setTargetType('ALL_USERS');
    setTrigger('APP_OPEN');
    setPrimaryCtaText('تصفح المنتج');
    setSecondaryCtaText('لاحقًا');
    setStartsAt('');
    setEndsAt('');
    setSelectedImage(null);
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال عنوان النافذة');
      return;
    }

    if (!editingId && !selectedImage) {
      Alert.alert('تنبيه', 'يرجى اختيار صورة للنافذة المنبثقة');
      return;
    }

    setSaving(true);
    try {
      let id = editingId;
      const payload = {
        title,
        message,
        targetType,
        trigger,
        primaryCtaText,
        secondaryCtaText,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        isDismissible: true,
      };

      if (editingId) {
        await api.put(`/popups/${editingId}`, payload);
      } else {
        const created = await api.post<{ popup: Popup }>('/popups', payload);
        id = created.popup.id;
      }

      if (id && selectedImage) {
        await api.upload(`/popups/${id}/image`, selectedImage);
      }

      Alert.alert('تم', editingId ? 'تم تحديث النافذة المنبثقة' : 'تم إنشاء النافذة المنبثقة');
      resetForm();
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل إنشاء النافذة');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (popup: Popup) => {
    setEditingId(popup.id);
    setTitle(popup.title || '');
    setMessage(popup.message || '');
    setTargetType(popup.targetType || 'ALL_USERS');
    setTrigger(popup.trigger || 'APP_OPEN');
    setPrimaryCtaText(popup.primaryCtaText || 'تصفح المنتج');
    setSecondaryCtaText(popup.secondaryCtaText || 'لاحقًا');
    setStartsAt(popup.startsAt ? new Date(popup.startsAt).toISOString() : '');
    setEndsAt(popup.endsAt ? new Date(popup.endsAt).toISOString() : '');
    setSelectedImage(null);
  };

  const remove = async (id: string) => {
    try {
      await api.del(`/popups/${id}`);
      Alert.alert('تم', 'تم حذف النافذة');
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر الحذف');
    }
  };

  const toggleEnabled = async (popup: Popup) => {
    try {
      await api.put(`/popups/${popup.id}`, { isEnabled: !popup.isEnabled });
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر تحديث الحالة');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>{editingId ? 'تعديل Popup' : 'Popup Manager'}</Text>
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
        <TextInput style={styles.input} value={startsAt} onChangeText={setStartsAt} placeholder="Start date ISO (اختياري)" textAlign="right" />
        <TextInput style={styles.input} value={endsAt} onChangeText={setEndsAt} placeholder="End date ISO (اختياري)" textAlign="right" />

        <AppButton label={selectedImage ? `الصورة: ${selectedImage.name}` : 'اختيار صورة النافذة'} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.selectedPreview} /> : null}

        <AppButton label={editingId ? 'حفظ التعديلات' : 'حفظ النافذة'} onPress={save} loading={saving} />
        {editingId ? <AppButton label="إلغاء التعديل" onPress={resetForm} variant="ghost" /> : null}
      </View>

      {popups.map((popup) => (
        <View key={popup.id} style={styles.item}>
          {popup.imageUrl ? <Image source={{ uri: api.resolveAssetUrl(popup.imageUrl) }} style={styles.itemImage} /> : null}
          <Text style={styles.itemTitle}>{popup.title}</Text>
          <Text style={styles.itemMeta}>{popup.message || '-'}</Text>
          <Text style={styles.itemMeta}>التاريخ: {popup.startsAt ? new Date(popup.startsAt).toLocaleDateString('ar-SA') : '-'} → {popup.endsAt ? new Date(popup.endsAt).toLocaleDateString('ar-SA') : '-'}</Text>
          <Text style={styles.itemMeta}>الحالة: {popup.isEnabled ? 'مفعل' : 'متوقف'}</Text>

          <View style={styles.actionRow}>
            <Pressable onPress={() => startEdit(popup)} style={styles.actionBtn}>
              <Text style={styles.actionText}>تعديل</Text>
            </Pressable>
            <Pressable onPress={() => toggleEnabled(popup)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{popup.isEnabled ? 'إيقاف' : 'تفعيل'}</Text>
            </Pressable>
            <Pressable onPress={() => remove(popup.id)} style={styles.actionDanger}>
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
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#cffafe',
  },
  selectedPreview: {
    width: '100%',
    height: 160,
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
