import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

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
      <FlatList
        data={markets}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.region}>{item.region}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>عدد البائعين: {item.vendorCount}</Text>
              {item.priceRange ? (
                <Text style={styles.metaText}>نطاق الأسعار: {item.priceRange}</Text>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
});

