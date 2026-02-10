import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  placement: string;
  enabled: boolean;
  ctaText?: string | null;
  actionType?: string;
  actionTargetId?: string | null;
  externalUrl?: string | null;
  startAt?: string | null;
  endAt?: string | null;
}

const PLACEMENTS = [
  { label: "الواجهة الرئيسية", value: "HOME_HERO" },
  { label: "أعلى صفحة السوق", value: "MARKET_TOP" },
  { label: "أسفل صفحة السوق", value: "MARKET_BOTTOM" },
  { label: "أعلى صفحة المنتجات", value: "PRODUCTS_TOP" },
];

const ACTION_TYPES = [
  { label: "لا شيء", value: "NONE" },
  { label: "فتح سوق", value: "OPEN_MARKET" },
  { label: "فتح منتج", value: "OPEN_PRODUCT" },
  { label: "فتح رابط خارجي", value: "EXTERNAL_URL" },
];

export const BannersScreen: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [placement, setPlacement] = useState("HOME_HERO");
  const [actionType, setActionType] = useState("NONE");
  const [actionTargetId, setActionTargetId] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get<Banner[]>("/content/admin/banners");
      setBanners(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر تحميل البنرات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCtaText("");
    setPlacement("HOME_HERO");
    setActionType("NONE");
    setActionTargetId("");
    setExternalUrl("");
    setEnabled(true);
    setSelectedImage(null);
    setEditingBanner(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description || "");
    setCtaText(banner.ctaText || "");
    setPlacement(banner.placement);
    setActionType(banner.actionType || "NONE");
    setActionTargetId(banner.actionTargetId || "");
    setExternalUrl(banner.externalUrl || "");
    setEnabled(banner.enabled);
    setSelectedImage(banner.imageUrl);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("خطأ", "يجب السماح بالوصول إلى المكتبة لاختيار الصور");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر اختيار الصورة");
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال عنوان البنر");
      return;
    }

    try {
      setSaving(true);

      if (selectedImage && !selectedImage.startsWith('http')) {
        // Upload with image
        const formData = new FormData();
        formData.append('title', title.trim());
        if (description.trim()) formData.append('description', description.trim());
        if (ctaText.trim()) formData.append('ctaText', ctaText.trim());
        formData.append('placement', placement);
        formData.append('actionType', actionType);
        if (actionTargetId.trim()) formData.append('actionTargetId', actionTargetId.trim());
        if (externalUrl.trim()) formData.append('externalUrl', externalUrl.trim());
        formData.append('enabled', enabled.toString());

        // Add image file
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const fileName = `banner-${Date.now()}.jpg`;
        formData.append('image', blob, fileName);

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

        if (editingBanner) {
          await api.patch(`/content/banners/${editingBanner.id}`, formData, config);
          Alert.alert("تم", "تم تحديث البنر بنجاح");
        } else {
          await api.post("/content/banners", formData, config);
          Alert.alert("تم", "تم إنشاء البنر بنجاح");
        }
      } else {
        // Upload without image (JSON)
        const data = {
          title: title.trim(),
          description: description.trim() || undefined,
          ctaText: ctaText.trim() || undefined,
          placement,
          actionType,
          actionTargetId: actionTargetId.trim() || undefined,
          externalUrl: externalUrl.trim() || undefined,
          enabled,
        };

        if (editingBanner) {
          await api.patch(`/content/banners/${editingBanner.id}`, data);
          Alert.alert("تم", "تم تحديث البنر بنجاح");
        } else {
          await api.post("/content/banners", data);
          Alert.alert("تم", "تم إنشاء البنر بنجاح");
        }
      }

      setModalVisible(false);
      await loadBanners();
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر حفظ البنر، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string) => {
    try {
      await api.post(`/content/banners/${id}/toggle`);
      await loadBanners();
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر تغيير حالة البنر");
    }
  };

  const deleteBanner = async (id: string) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا البنر؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/content/banners/${id}`);
              await loadBanners();
              Alert.alert("تم", "تم حذف البنر بنجاح");
            } catch (err) {
              console.error(err);
              Alert.alert("خطأ", "تعذّر حذف البنر");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>إدارة البنرات</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ إضافة بنر</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={banners}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {PLACEMENTS.find(p => p.value === item.placement)?.label} • {item.enabled ? "مفعل" : "معطل"}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.editBtnText}>تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteBanner(item.id)}
                >
                  <Text style={styles.deleteBtnText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemFooter}>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Switch value={item.enabled} onValueChange={() => void toggle(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>لا توجد بنرات حالية.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingBanner ? "تعديل البنر" : "إضافة بنر جديد"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>العنوان *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="عنوان البنر"
            />

            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="وصف البنر"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>الصورة</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={() => void pickImage()}>
              <Text style={styles.imagePickerText}>
                {selectedImage ? "تغيير الصورة" : "اختيار صورة"}
              </Text>
            </TouchableOpacity>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            )}

            <Text style={styles.label}>نص الزر</Text>
            <TextInput
              style={styles.input}
              value={ctaText}
              onChangeText={setCtaText}
              placeholder="مثال: تسوق الآن"
            />

            <Text style={styles.label}>الموقع</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={placement} onValueChange={setPlacement}>
                {PLACEMENTS.map(p => (
                  <Picker.Item key={p.value} label={p.label} value={p.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>نوع الإجراء</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={actionType} onValueChange={setActionType}>
                {ACTION_TYPES.map(a => (
                  <Picker.Item key={a.value} label={a.label} value={a.value} />
                ))}
              </Picker>
            </View>

            {actionType === "OPEN_MARKET" && (
              <>
                <Text style={styles.label}>معرف السوق</Text>
                <TextInput
                  style={styles.input}
                  value={actionTargetId}
                  onChangeText={setActionTargetId}
                  placeholder="معرف السوق"
                />
              </>
            )}

            {actionType === "OPEN_PRODUCT" && (
              <>
                <Text style={styles.label}>معرف المنتج</Text>
                <TextInput
                  style={styles.input}
                  value={actionTargetId}
                  onChangeText={setActionTargetId}
                  placeholder="معرف المنتج"
                />
              </>
            )}

            {actionType === "EXTERNAL_URL" && (
              <>
                <Text style={styles.label}>الرابط الخارجي</Text>
                <TextInput
                  style={styles.input}
                  value={externalUrl}
                  onChangeText={setExternalUrl}
                  placeholder="https://example.com"
                />
              </>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.label}>مفعل</Text>
              <Switch value={enabled} onValueChange={setEnabled} />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => void handleSave()}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingBanner ? "تحديث" : "إنشاء"}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "right",
  },
  list: {
    marginTop: 16,
  },
  item: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  itemMeta: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "right",
  },
  itemActions: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  editBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  itemFooter: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemDesc: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "right",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  closeBtn: {
    fontSize: 24,
    color: theme.colors.muted,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  switchRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePickerBtn: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },
  imagePickerText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
});

