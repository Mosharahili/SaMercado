import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";
import { BoosterBannerSlot } from "@components/BoosterBannerSlot";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageUrl?: string | null;
  market: { name: string };
  vendor: { displayName: string };
  category?: { name: string } | null;
}

export const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState(true);
  const [topBanners, setTopBanners] = useState<any[]>([]);

  useEffect(() => {
    void (async () => {
      const [prodsRes, topRes] = await Promise.all([
        api.get<Product[]>("/catalog/products"),
        api.get("/content/banners", { params: { placement: "PRODUCT_TOP" } }),
      ]);
      setProducts(prodsRes.data);
      setTopBanners(topRes.data);
    })();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن منتج"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{grid ? "شبكة" : "قائمة"}</Text>
          <Switch value={grid} onValueChange={setGrid} />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={grid ? 2 : 1}
        columnWrapperStyle={grid ? styles.gridRow : undefined}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            {topBanners.map((b) => (
              <BoosterBannerSlot
                key={b.id}
                title={b.title}
                description={b.description}
                ctaText={b.ctaText}
                imageUrl={b.imageUrl}
                placement="PRODUCT_TOP"
              />
            ))}
          </>
        }
        renderItem={({ item, index }) => (
          <>
            {index > 0 && index % 6 === 0 ? (
              <BoosterBannerSlot
                title="عروض على المنتجات المختارة"
                description="استفد من خصومات السوق المركزي"
                placement="PRODUCT_INLINE"
              />
            ) : null}
            <View style={[styles.card, grid && styles.cardGrid]}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.market.name} • {item.vendor.displayName}
              </Text>
              {item.category ? <Text style={styles.category}>{item.category.name}</Text> : null}
              <Text style={styles.price}>
                {item.price} ر.س / {item.unit === "KILO" ? "كيلو" : item.unit === "BOX" ? "صندوق" : "ربطة"}
              </Text>
            </View>
          </>
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
  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: "right",
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginLeft: 8,
  },
  toggleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  toggleLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: theme.colors.muted,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flex: 1,
  },
  cardGrid: {
    marginHorizontal: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.text,
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    color: theme.colors.muted,
    textAlign: "right",
  },
  category: {
    marginTop: 4,
    fontSize: 11,
    color: theme.colors.primary,
    textAlign: "right",
  },
  price: {
    marginTop: 8,
    fontWeight: "700",
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: "left",
  },
});

