import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface Market {
  id: string;
  name: string;
  region: string;
  vendorCount: number;
}

export const MarketsManagementScreen: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get<Market[]>("/admin/markets");
        if (mounted) setMarkets(res.data);
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
      <Text style={styles.title}>إدارة الأسواق</Text>
      <FlatList
        data={markets}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>
              المنطقة: {item.region} • عدد البائعين: {item.vendorCount}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>لا توجد أسواق بعد.</Text>}
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
});

