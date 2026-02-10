import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface OrderItemRow {
  product: { name: string; market: { name: string } };
}

interface OrderRow {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItemRow[];
}

export const OrdersManagementScreen: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get<OrderRow[]>("/orders");
        if (mounted) setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إدارة الطلبات</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>طلب #{item.id.slice(0, 6)}</Text>
            <Text style={styles.itemMeta}>
              العميل: {item.user.name} ({item.user.email})
            </Text>
            <Text style={styles.itemMeta}>
              الحالة: {item.status} • الإجمالي: {Number(item.total).toFixed(2)} ريال
            </Text>
            {item.items[0] && (
              <Text style={styles.itemMeta}>
                أول منتج: {item.items[0].product.name} – {item.items[0].product.market.name}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>لا توجد طلبات بعد.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
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
});

