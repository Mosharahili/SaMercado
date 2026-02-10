import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Switch, Text, View } from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  placement: string;
  enabled: boolean;
}

export const BannersScreen: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBanners = async () => {
    try {
      setLoading(true);
      // نبدأ ببنرات الواجهة الرئيسية
      const res = await api.get<Banner[]>("/content/banners", {
        params: { placement: "HOME_HERO" },
      });
      setBanners(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  const toggle = async (id: string) => {
    try {
      await api.post(`/content/banners/${id}/toggle`);
      await loadBanners();
    } catch (err) {
      console.error(err);
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
      <Text style={styles.title}>إدارة البنرات (Booster)</Text>
      <FlatList
        style={styles.list}
        data={banners}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Switch value={item.enabled} onValueChange={() => void toggle(item.id)} />
            </View>
            {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>لا توجد بنرات حالية.</Text>}
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
  list: {
    marginTop: 16,
  },
  item: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },
  itemDesc: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "right",
  },
});

