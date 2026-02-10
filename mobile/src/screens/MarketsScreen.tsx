import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface Market {
  id: string;
  name: string;
  region: string;
  description?: string | null;
  imageUrl?: string | null;
  vendorCount: number;
  operatingFrom?: string | null;
  operatingTo?: string | null;
  priceRange?: string | null;
}

export const MarketsScreen: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await api.get<Market[]>("/catalog/markets");
      setMarkets(res.data);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الأسواق</Text>
        <Text style={styles.headerSubtitle}>اكتشف أسواق الرياض المتنوعة</Text>
      </View>

      <FlatList
        data={markets}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={renderMarket}
      />
    </View>
  );
};

const renderMarket = ({ item }: { item: Market }) => (
  <TouchableOpacity style={styles.card} onPress={() => {}}>
    {item.imageUrl ? (
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
    ) : (
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardImageText}>{item.name.charAt(0)}</Text>
      </View>
    )}
    <View style={styles.cardContent}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.region}>{item.region}</Text>
      {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>عدد البائعين: {item.vendorCount}</Text>
        {item.priceRange ? (
          <Text style={styles.metaText}>نطاق الأسعار: {item.priceRange}</Text>
        ) : null}
      </View>
      {item.operatingFrom && item.operatingTo ? (
        <Text style={styles.hours}>ساعات العمل: {item.operatingFrom} - {item.operatingTo}</Text>
      ) : null}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>تصفح السوق</Text>
      </TouchableOpacity>
    </View>
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "right",
  },
  region: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "right",
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "right",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  hours: {
    marginTop: 8,
    fontSize: 12,
    color: theme.colors.primary,
    textAlign: "right",
  },
  button: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

