import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface OwnerSummary {
  totalOrders: number;
  totalRevenue: number;
  dailyOrders: { date: string; count: number }[];
  topProducts: { productId: string; _sum: { quantity: number | null } }[];
}

export const AnalyticsScreen: React.FC = () => {
  const [data, setData] = useState<OwnerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get<OwnerSummary>("/analytics/summary/owner");
        if (mounted) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("تعذّر تحميل بيانات التحليلات");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
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

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>لوحة التحليلات</Text>
        <Text style={styles.error}>{error ?? "لا توجد بيانات"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>لوحة التحليلات</Text>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>إجمالي الطلبات</Text>
          <Text style={styles.cardValue}>{data.totalOrders}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>إجمالي الإيرادات (ريال)</Text>
          <Text style={styles.cardValue}>{Number(data.totalRevenue).toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>الطلبات اليومية (آخر 30 يوم)</Text>
      {data.dailyOrders.slice(0, 7).map((d) => (
        <View key={d.date} style={styles.row}>
          <Text style={styles.rowDate}>{d.date}</Text>
          <Text style={styles.rowValue}>{d.count}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>المنتجات الأعلى طلبًا</Text>
      {data.topProducts.map((p, idx) => (
        <View key={p.productId ?? idx.toString()} style={styles.row}>
          <Text style={styles.rowDate}>منتج #{idx + 1}</Text>
          <Text style={styles.rowValue}>{p._sum.quantity ?? 0}</Text>
        </View>
      ))}
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
  error: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.error ?? "#dc2626",
    textAlign: "right",
  },
  cardRow: {
    flexDirection: "row-reverse",
    marginTop: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: "right",
  },
  cardValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  sectionTitle: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowDate: {
    fontSize: 13,
    color: theme.colors.text,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
});

