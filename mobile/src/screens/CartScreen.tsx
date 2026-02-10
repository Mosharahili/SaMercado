import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
  };
}

type PaymentMethod = "STC_PAY" | "MADA" | "APPLE_PAY" | "CASH_ON_DELIVERY";

export const CartScreen: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");

  const loadCart = async () => {
    const res = await api.get<CartItem[]>("/cart");
    setItems(res.data);
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }
    await api.post("/cart/update", { cartItemId, quantity });
    await loadCart();
  };

  const removeItem = async (cartItemId: string) => {
    await api.post("/cart/remove", { cartItemId });
    await loadCart();
  };

  useEffect(() => {
    void loadCart();
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const onCheckout = async () => {
    const orderRes = await api.post("/orders", {
      paymentMethod,
      address: "عنوان افتراضي في الرياض",
    });
    if (paymentMethod !== "CASH_ON_DELIVERY") {
      await api.post("/payments/start", {
        orderId: orderRes.data.id,
        method: paymentMethod,
      });
    }
    await loadCart();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سلة المشتريات</Text>
        <Text style={styles.headerSubtitle}>{items.length} منتج</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                {item.product.price.toFixed(2)} ر.س × {item.quantity}
              </Text>
              <Text style={styles.itemTotal}>
                المجموع: {(item.product.price * item.quantity).toFixed(2)} ر.س
              </Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => void removeItem(item.id)}
              >
                <Ionicons name="trash" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => void updateQuantity(item.id, item.quantity - 1)}
                >
                  <Ionicons name="remove" size= {16} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() => void updateQuantity(item.id, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>سلة فارغة</Text>
            <Text style={styles.emptyText}>ابدأ بإضافة بعض المنتجات إلى سلتك</Text>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={styles.checkoutContainer}>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>المجموع الفرعي:</Text>
              <Text style={styles.summaryValue}>{subtotal.toFixed(2)} ر.س</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>التوصيل:</Text>
              <Text style={styles.summaryValue}>حسب الموقع</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>الضرائب:</Text>
              <Text style={styles.summaryValue}>حسب المنتجات</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>المجموع الكلي:</Text>
              <Text style={styles.totalValue}>{subtotal.toFixed(2)} ر.س</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>اختر طريقة الدفع</Text>
          <View style={styles.paymentGrid}>
            <PaymentChip
              label="STC Pay"
              selected={paymentMethod === "STC_PAY"}
              onPress={() => setPaymentMethod("STC_PAY")}
            />
            <PaymentChip
              label="Mada"
              selected={paymentMethod === "MADA"}
              onPress={() => setPaymentMethod("MADA")}
            />
            <PaymentChip
              label="Apple Pay"
              selected={paymentMethod === "APPLE_PAY"}
              onPress={() => setPaymentMethod("APPLE_PAY")}
            />
            <PaymentChip
              label="الدفع عند الاستلام"
              selected={paymentMethod === "CASH_ON_DELIVERY"}
              onPress={() => setPaymentMethod("CASH_ON_DELIVERY")}
            />
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout} disabled={!items.length}>
            <Text style={styles.checkoutText}>إتمام الطلب</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const PaymentChip: React.FC<{ label: string; selected: boolean; onPress: () => void }> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, selected && { backgroundColor: theme.colors.primary }]}
  >
    <Text style={[styles.chipText, selected && { color: "#ffffff" }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "right",
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "right",
  },
  itemTotal: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.primary,
    textAlign: "right",
  },
  itemActions: {
    alignItems: "center",
  },
  removeBtn: {
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    minWidth: 24,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
  },
  checkoutContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 20,
  },
  summary: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
    marginBottom: 12,
  },
  paymentGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    marginBottom: 8,
    minWidth: 100,
    alignItems: "center",
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  checkoutBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

