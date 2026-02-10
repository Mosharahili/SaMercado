import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemPrice}>
                {item.product.price} ر.س × {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemTotal}>{item.product.price * item.quantity} ر.س</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>سلة المشتريات فارغة، ابدأ بإضافة المنتجات.</Text>
        }
      />

      <View style={styles.summary}>
        <Text style={styles.summaryRow}>المجموع: {subtotal.toFixed(2)} ر.س</Text>
        <Text style={styles.summaryRow}>التوصيل والضريبة تُحسب من الخادم</Text>

        <Text style={styles.sectionTitle}>خيارات الدفع</Text>
        <View style={styles.paymentRow}>
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
  itemRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "right",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: theme.colors.muted,
  },
  summary: {
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  summaryRow: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: "right",
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    color: theme.colors.text,
  },
  paymentRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  checkoutBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  checkoutText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});

