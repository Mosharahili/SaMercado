import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface Market {
  id: string;
  name: string;
  region: string;
  description?: string | null;
  imageUrl?: string | null;
  operatingFrom?: string | null;
  operatingTo?: string | null;
  priceRange?: string | null;
  vendorCount: number;
}

export const MarketsManagementScreen: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [operatingFrom, setOperatingFrom] = useState("");
  const [operatingTo, setOperatingTo] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const res = await api.get<Market[]>("/admin/markets");
      setMarkets(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر تحميل الأسواق");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMarkets();
  }, []);

  const resetForm = () => {
    setName("");
    setRegion("");
    setDescription("");
    setOperatingFrom("");
    setOperatingTo("");
    setPriceRange("");
    setEditingMarket(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (market: Market) => {
    setEditingMarket(market);
    setName(market.name);
    setRegion(market.region);
    setDescription(market.description || "");
    setOperatingFrom(market.operatingFrom || "");
    setOperatingTo(market.operatingTo || "");
    setPriceRange(market.priceRange || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم السوق");
      return;
    }
    if (!region.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال المنطقة");
      return;
    }

    try {
      setSaving(true);
      const data = {
        name: name.trim(),
        region: region.trim(),
        description: description.trim() || undefined,
        operatingFrom: operatingFrom.trim() || undefined,
        operatingTo: operatingTo.trim() || undefined,
        priceRange: priceRange.trim() || undefined,
      };

      if (editingMarket) {
        await api.patch(`/admin/markets/${editingMarket.id}`, data);
        Alert.alert("تم", "تم تحديث السوق بنجاح");
      } else {
        await api.post("/admin/markets", data);
        Alert.alert("تم", "تم إنشاء السوق بنجاح");
      }

      setModalVisible(false);
      await loadMarkets();
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر حفظ السوق، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  const deleteMarket = async (id: string) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذه السوق؟ سيتم حذف جميع المنتجات والروابط المرتبطة بها.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/admin/markets/${id}`);
              await loadMarkets();
              Alert.alert("تم", "تم حذف السوق بنجاح");
            } catch (err) {
              console.error(err);
              Alert.alert("خطأ", "تعذّر حذف السوق");
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
        <Text style={styles.title}>إدارة الأسواق</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ إضافة سوق</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={markets}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  المنطقة: {item.region} • عدد البائعين: {item.vendorCount}
                </Text>
                {item.description && (
                  <Text style={styles.itemDesc}>{item.description}</Text>
                )}
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
                  onPress={() => deleteMarket(item.id)}
                >
                  <Text style={styles.deleteBtnText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>لا توجد أسواق بعد.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingMarket ? "تعديل السوق" : "إضافة سوق جديدة"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>اسم السوق *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="اسم السوق"
            />

            <Text style={styles.label}>المنطقة *</Text>
            <TextInput
              style={styles.input}
              value={region}
              onChangeText={setRegion}
              placeholder="مثال: الرياض، جدة"
            />

            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="وصف السوق"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>ساعات العمل (من)</Text>
            <TextInput
              style={styles.input}
              value={operatingFrom}
              onChangeText={setOperatingFrom}
              placeholder="مثال: 08:00"
            />

            <Text style={styles.label}>ساعات العمل (إلى)</Text>
            <TextInput
              style={styles.input}
              value={operatingTo}
              onChangeText={setOperatingTo}
              placeholder="مثال: 22:00"
            />

            <Text style={styles.label}>نطاق الأسعار</Text>
            <TextInput
              style={styles.input}
              value={priceRange}
              onChangeText={setPriceRange}
              placeholder="مثال: 50-200 ريال"
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => void handleSave()}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingMarket ? "تحديث" : "إنشاء"}
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
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
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
  itemDesc: {
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

