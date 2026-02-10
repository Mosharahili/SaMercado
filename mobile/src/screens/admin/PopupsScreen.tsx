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
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface Popup {
  id: string;
  title: string;
  message: string | null;
  imageUrl: string | null;
  targetType: string;
  enabled: boolean;
  primaryCtaText?: string | null;
  secondaryCtaText?: string | null;
  marketIds?: string[];
  categoryIds?: string[];
  startAt?: string | null;
  endAt?: string | null;
}

const TARGET_TYPES = [
  { label: "جميع المستخدمين", value: "ALL_USERS" },
  { label: "مستخدمون جدد", value: "NEW_USERS" },
  { label: "أسواق محددة", value: "SPECIFIC_MARKETS" },
  { label: "فئات محددة", value: "SPECIFIC_CATEGORIES" },
];

export const PopupsScreen: React.FC = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [primaryCtaText, setPrimaryCtaText] = useState("");
  const [secondaryCtaText, setSecondaryCtaText] = useState("");
  const [targetType, setTargetType] = useState("ALL_USERS");
  const [marketIds, setMarketIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);

  const loadPopups = async () => {
    try {
      setLoading(true);
      const res = await api.get<Popup[]>("/content/admin/popups");
      setPopups(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر تحميل النوافذ المنبثقة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPopups();
  }, []);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setPrimaryCtaText("");
    setSecondaryCtaText("");
    setTargetType("ALL_USERS");
    setMarketIds([]);
    setCategoryIds([]);
    setEnabled(true);
    setEditingPopup(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (popup: Popup) => {
    setEditingPopup(popup);
    setTitle(popup.title);
    setMessage(popup.message || "");
    setPrimaryCtaText(popup.primaryCtaText || "");
    setSecondaryCtaText(popup.secondaryCtaText || "");
    setTargetType(popup.targetType);
    setMarketIds(popup.marketIds || []);
    setCategoryIds(popup.categoryIds || []);
    setEnabled(popup.enabled);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال عنوان النافذة المنبثقة");
      return;
    }

    try {
      setSaving(true);
      const data = {
        title: title.trim(),
        message: message.trim() || undefined,
        primaryCtaText: primaryCtaText.trim() || undefined,
        secondaryCtaText: secondaryCtaText.trim() || undefined,
        targetType,
        marketIds: targetType === "SPECIFIC_MARKETS" ? marketIds : undefined,
        categoryIds: targetType === "SPECIFIC_CATEGORIES" ? categoryIds : undefined,
        enabled,
      };

      if (editingPopup) {
        await api.patch(`/content/popups/${editingPopup.id}`, data);
        Alert.alert("تم", "تم تحديث النافذة المنبثقة بنجاح");
      } else {
        await api.post("/content/popups", data);
        Alert.alert("تم", "تم إنشاء النافذة المنبثقة بنجاح");
      }

      setModalVisible(false);
      await loadPopups();
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر حفظ النافذة المنبثقة، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string) => {
    try {
      await api.post(`/content/popups/${id}/toggle`);
      await loadPopups();
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر تغيير حالة النافذة المنبثقة");
    }
  };

  const deletePopup = async (id: string) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذه النافذة المنبثقة؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/content/popups/${id}`);
              await loadPopups();
              Alert.alert("تم", "تم حذف النافذة المنبثقة بنجاح");
            } catch (err) {
              console.error(err);
              Alert.alert("خطأ", "تعذّر حذف النافذة المنبثقة");
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
        <Text style={styles.title}>إدارة النوافذ المنبثقة</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ إضافة نافذة</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={popups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {TARGET_TYPES.find(t => t.value === item.targetType)?.label} • {item.enabled ? "مفعل" : "معطل"}
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
                  onPress={() => deletePopup(item.id)}
                >
                  <Text style={styles.deleteBtnText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemFooter}>
              <Text style={styles.itemDesc}>{item.message}</Text>
              <Switch value={item.enabled} onValueChange={() => void toggle(item.id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>لا توجد نوافذ منبثقة حالية.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPopup ? "تعديل النافذة المنبثقة" : "إضافة نافذة منبثقة جديدة"}
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
              placeholder="عنوان النافذة المنبثقة"
            />

            <Text style={styles.label}>الرسالة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="محتوى الرسالة"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>نص الزر الأساسي</Text>
            <TextInput
              style={styles.input}
              value={primaryCtaText}
              onChangeText={setPrimaryCtaText}
              placeholder="مثال: تسوق الآن"
            />

            <Text style={styles.label}>نص الزر الثانوي</Text>
            <TextInput
              style={styles.input}
              value={secondaryCtaText}
              onChangeText={setSecondaryCtaText}
              placeholder="مثال: تجاهل"
            />

            <Text style={styles.label}>نوع الاستهداف</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={targetType} onValueChange={setTargetType}>
                {TARGET_TYPES.map(t => (
                  <Picker.Item key={t.value} label={t.label} value={t.value} />
                ))}
              </Picker>
            </View>

            {targetType === "SPECIFIC_MARKETS" && (
              <>
                <Text style={styles.label}>معرفات الأسواق (مفصولة بفواصل)</Text>
                <TextInput
                  style={styles.input}
                  value={marketIds.join(", ")}
                  onChangeText={(text) => setMarketIds(text.split(",").map(id => id.trim()).filter(id => id))}
                  placeholder="market1, market2, market3"
                />
              </>
            )}

            {targetType === "SPECIFIC_CATEGORIES" && (
              <>
                <Text style={styles.label}>معرفات الفئات (مفصولة بفواصل)</Text>
                <TextInput
                  style={styles.input}
                  value={categoryIds.join(", ")}
                  onChangeText={(text) => setCategoryIds(text.split(",").map(id => id.trim()).filter(id => id))}
                  placeholder="category1, category2, category3"
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
                  {editingPopup ? "تحديث" : "إنشاء"}
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
    height: 100,
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
});

