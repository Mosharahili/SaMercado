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

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: "KILO" | "BUNDLE" | "BOX";
  imageUrl: string | null;
  available: boolean;
  market: { id: string; name: string };
  vendor: { id: string; displayName: string };
  category?: { id: string; name: string } | null;
}

interface Market {
  id: string;
  name: string;
  region: string;
}

interface Vendor {
  id: string;
  displayName: string;
  user: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
  type: "VEGETABLE" | "FRUIT" | "DATES";
}

export const ProductsManagementScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<"KILO" | "BUNDLE" | "BOX">("KILO");
  const [marketId, setMarketId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [available, setAvailable] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, marketsRes, vendorsRes, categoriesRes] = await Promise.all([
        api.get<Product[]>("/admin/products"),
        api.get<Market[]>("/admin/markets"),
        api.get<Vendor[]>("/admin/vendors"),
        api.get<Category[]>("/catalog/categories"),
      ]);
      setProducts(productsRes.data);
      setMarkets(marketsRes.data);
      setVendors(vendorsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر تحميل بيانات المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setUnit("KILO");
    setMarketId("");
    setVendorId("");
    setCategoryId("");
    setAvailable(true);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setUnit(product.unit);
    setMarketId(product.market.id);
    setVendorId(product.vendor.id);
    setCategoryId(product.category?.id || "");
    setAvailable(product.available);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم المنتج");
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert("تنبيه", "الرجاء إدخال سعر صحيح");
      return;
    }
    if (!marketId) {
      Alert.alert("تنبيه", "الرجاء اختيار السوق");
      return;
    }
    if (!vendorId) {
      Alert.alert("تنبيه", "الرجاء اختيار البائع");
      return;
    }

    try {
      setSaving(true);
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        unit,
        marketId,
        vendorId,
        categoryId: categoryId || undefined,
        available,
      };

      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct.id}`, data);
        Alert.alert("تم", "تم تحديث المنتج بنجاح");
      } else {
        await api.post("/admin/products", data);
        Alert.alert("تم", "تم إنشاء المنتج بنجاح");
      }

      setModalVisible(false);
      await loadData();
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر حفظ المنتج، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا المنتج؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/admin/products/${id}`);
              await loadData();
              Alert.alert("تم", "تم حذف المنتج بنجاح");
            } catch (err) {
              console.error(err);
              Alert.alert("خطأ", "تعذّر حذف المنتج");
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await api.patch(`/admin/products/${id}`, { available: !product.available });
        await loadData();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذّر تغيير حالة المنتج");
    }
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
        <Text style={styles.title}>إدارة المنتجات</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ إضافة منتج</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.market.name} • {item.vendor.displayName} • {item.price} ريال/{item.unit.toLowerCase()}
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
                  onPress={() => deleteProduct(item.id)}
                >
                  <Text style={styles.deleteBtnText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemFooter}>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <View style={styles.availabilityRow}>
                <Text style={styles.availabilityLabel}>متاح</Text>
                <Switch
                  value={item.available}
                  onValueChange={() => void toggleAvailability(item.id)}
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>لا توجد منتجات حالية.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>اسم المنتج *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="اسم المنتج"
            />

            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="وصف المنتج"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>السعر *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Text style={styles.label}>الوحدة</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={unit} onValueChange={(value) => setUnit(value)}>
                <Picker.Item label="كيلو" value="KILO" />
                <Picker.Item label="حزمة" value="BUNDLE" />
                <Picker.Item label="صندوق" value="BOX" />
              </Picker>
            </View>

            <Text style={styles.label}>السوق *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={marketId} onValueChange={setMarketId}>
                <Picker.Item label="اختر السوق" value="" />
                {markets.map(market => (
                  <Picker.Item key={market.id} label={market.name} value={market.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>البائع *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={vendorId} onValueChange={setVendorId}>
                <Picker.Item label="اختر البائع" value="" />
                {vendors.map(vendor => (
                  <Picker.Item key={vendor.id} label={vendor.displayName} value={vendor.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>الفئة</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
                <Picker.Item label="بدون فئة" value="" />
                {categories.map(category => (
                  <Picker.Item key={category.id} label={category.name} value={category.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>متاح</Text>
              <Switch value={available} onValueChange={setAvailable} />
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
                  {editingProduct ? "تحديث" : "إنشاء"}
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
  availabilityRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  availabilityLabel: {
    fontSize: 13,
    color: theme.colors.muted,
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
});

