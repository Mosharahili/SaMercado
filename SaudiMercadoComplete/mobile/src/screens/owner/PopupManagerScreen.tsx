import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { DatePickerField } from '@components/DatePickerField';
import { api, UploadFile } from '@api/client';
import { Popup } from '@app-types/models';
import { useLanguage } from '@hooks/useLanguage';

export const PopupManagerScreen = () => {
  const { isRTL, tr, locale } = useLanguage();
  const defaultPrimaryCta = tr('تصفح المنتج', 'Browse Product');
  const defaultSecondaryCta = tr('لاحقًا', 'Later');
  const [popups, setPopups] = useState<Popup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('ALL_USERS');
  const [trigger, setTrigger] = useState('APP_OPEN');
  const [primaryCtaText, setPrimaryCtaText] = useState(defaultPrimaryCta);
  const [secondaryCtaText, setSecondaryCtaText] = useState(defaultSecondaryCta);
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
      Alert.alert(tr('خطأ', 'Error'), error?.message || tr('تعذر اختيار الصورة', 'Unable to pick image'));
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
    setPrimaryCtaText(defaultPrimaryCta);
    setSecondaryCtaText(defaultSecondaryCta);
    setStartsAt('');
    setEndsAt('');
    setSelectedImage(null);
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى إدخال عنوان النافذة', 'Please enter popup title'));
      return;
    }

    if (!editingId && !selectedImage) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى اختيار صورة للنافذة المنبثقة', 'Please choose popup image'));
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

      Alert.alert(tr('تم', 'Done'), editingId ? tr('تم تحديث النافذة المنبثقة', 'Popup updated') : tr('تم إنشاء النافذة المنبثقة', 'Popup created'));
      resetForm();
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('فشل إنشاء النافذة', 'Failed to save popup'));
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
    setPrimaryCtaText(popup.primaryCtaText || defaultPrimaryCta);
    setSecondaryCtaText(popup.secondaryCtaText || defaultSecondaryCta);
    setStartsAt(popup.startsAt ? new Date(popup.startsAt).toISOString() : '');
    setEndsAt(popup.endsAt ? new Date(popup.endsAt).toISOString() : '');
    setSelectedImage(null);
  };

  const remove = async (id: string) => {
    try {
      await api.del(`/popups/${id}`);
      Alert.alert(tr('تم', 'Done'), tr('تم حذف النافذة', 'Popup deleted'));
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر الحذف', 'Unable to delete'));
    }
  };

  const toggleEnabled = async (popup: Popup) => {
    try {
      await api.put(`/popups/${popup.id}`, { isEnabled: !popup.isEnabled });
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر تحديث الحالة', 'Unable to update status'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{editingId ? tr('تعديل النافذة المنبثقة', 'Edit Popup') : tr('مدير النوافذ المنبثقة', 'Popup Manager')}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={tr('العنوان', 'Title')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder={tr('الرسالة', 'Message')} textAlign={isRTL ? 'right' : 'left'} />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={targetType} onValueChange={setTargetType}>
            <Picker.Item label={tr('جميع المستخدمين', 'All users')} value="ALL_USERS" />
            <Picker.Item label={tr('المستخدمون المسجلون فقط', 'Logged-in users only')} value="LOGGED_IN" />
            <Picker.Item label={tr('المستخدمون الجدد فقط', 'New users only')} value="NEW_USERS" />
            <Picker.Item label={tr('أسواق محددة', 'Specific markets')} value="SPECIFIC_MARKETS" />
            <Picker.Item label={tr('تصنيفات محددة', 'Specific categories')} value="SPECIFIC_CATEGORIES" />
          </Picker>
        </View>

        <View style={styles.pickerWrap}>
          <Picker selectedValue={trigger} onValueChange={setTrigger}>
            <Picker.Item label={tr('عند فتح التطبيق', 'On app open')} value="APP_OPEN" />
            <Picker.Item label={tr('عند فتح صفحة', 'On page open')} value="PAGE_OPEN" />
          </Picker>
        </View>

        <TextInput style={styles.input} value={primaryCtaText} onChangeText={setPrimaryCtaText} placeholder={tr('نص الزر الأساسي', 'Primary button text')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={secondaryCtaText} onChangeText={setSecondaryCtaText} placeholder={tr('نص الزر الثانوي', 'Secondary button text')} textAlign={isRTL ? 'right' : 'left'} />
        <DatePickerField label={tr('تاريخ البداية', 'Start date')} value={startsAt || undefined} placeholder={tr('اختر تاريخ البداية (اختياري)', 'Select start date (optional)')} onChange={(value) => setStartsAt(value || '')} />
        <DatePickerField label={tr('تاريخ النهاية', 'End date')} value={endsAt || undefined} placeholder={tr('اختر تاريخ النهاية (اختياري)', 'Select end date (optional)')} onChange={(value) => setEndsAt(value || '')} />

        <AppButton label={selectedImage ? tr(`الصورة: ${selectedImage.name}`, `Image: ${selectedImage.name}`) : tr('اختيار صورة النافذة', 'Choose popup image')} onPress={pickImage} variant="ghost" />
        {selectedImage ? <Image source={{ uri: selectedImage.uri }} style={styles.selectedPreview} resizeMode="cover" /> : null}

        <AppButton label={editingId ? tr('حفظ التعديلات', 'Save Changes') : tr('حفظ النافذة', 'Save Popup')} onPress={save} loading={saving} />
        {editingId ? <AppButton label={tr('إلغاء التعديل', 'Cancel Editing')} onPress={resetForm} variant="ghost" /> : null}
      </View>

      {popups.map((popup) => (
        <View key={popup.id} style={styles.item}>
          {popup.imageUrl ? (
            <Image source={{ uri: api.resolveAssetUrl(popup.imageUrl) }} style={styles.itemImage} resizeMode="cover" />
          ) : null}
          <Text style={[styles.itemTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{popup.title}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{popup.message || '-'}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>
            {tr('التاريخ', 'Date')}:{' '}
            {popup.startsAt ? new Date(popup.startsAt).toLocaleDateString(locale) : '-'} →{' '}
            {popup.endsAt ? new Date(popup.endsAt).toLocaleDateString(locale) : '-'}
          </Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الحالة', 'Status')}: {popup.isEnabled ? tr('مفعل', 'Active') : tr('متوقف', 'Disabled')}</Text>

          <View style={[styles.actionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Pressable onPress={() => startEdit(popup)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{tr('تعديل', 'Edit')}</Text>
            </Pressable>
            <Pressable onPress={() => toggleEnabled(popup)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{popup.isEnabled ? tr('إيقاف', 'Disable') : tr('تفعيل', 'Enable')}</Text>
            </Pressable>
            <Pressable onPress={() => remove(popup.id)} style={styles.actionDanger}>
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
