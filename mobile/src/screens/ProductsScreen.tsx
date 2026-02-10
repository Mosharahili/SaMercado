import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { api } from "@api/client";
import { theme } from "@theme/theme";
import { BoosterBannerSlot } from "@components/BoosterBannerSlot";

type UnitType = "KILO" | "BUNDLE" | "BOX";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  unit: UnitType;
  imageUrl?: string | null;
  market: { id: string; name: string };
  vendor: { displayName: string; id?: string };
  category?: { id: string; name: string; type: "VEGETABLE" | "FRUIT" | "DATES" } | null;
}

interface Market {
  id: string;
  name: string;
  region: string;
}

interface Category {
  id: string;
  name: string;
  type: "VEGETABLE" | "FRUIT" | "DATES";
}

interface BannerDto {
  id: string;
  title: string;
  description?: string | null;
  ctaText?: string | null;
  imageUrl: string;
}

type CategoryFilter = "ALL" | "VEGETABLE" | "FRUIT" | "DATES";

export const ProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topBanners, setTopBanners] = useState<BannerDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [grid, setGrid] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [marketFilter, setMarketFilter] = useState<string>("");
  const [vendorFilter, setVendorFilter] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [visibleCount, setVisibleCount] = useState(20);

  const load = async (initial: boolean) => {
    try {
      if (initial) setLoading(true);
      setError(null);
      const [prodsRes, marketsRes, catsRes, topRes] = await Promise.all([
        api.get<Product[]>("/catalog/products"),
        api.get<Market[]>("/catalog/markets"),
        api.get<Category[]>("/catalog/categories"),
        api.get<BannerDto[]>("/content/banners", { params: { placement: "PRODUCT_TOP" } }),
      ]);
      setProducts(prodsRes.data);
      setMarkets(marketsRes.data);
      setCategories(catsRes.data);
      setTopBanners(topRes.data);
      setVisibleCount(20);
    } catch (err) {
      console.error(err);
      setError("تعذّر تحميل قائمة المنتجات، حاول مرة أخرى.");
    } finally {
      if (initial) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void load(false);
  };

  const vendors = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.vendor.displayName).filter(Boolean)));
    return names;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = Number(minPrice);
    const max = Number(maxPrice);
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (categoryFilter !== "ALL") {
        if (!p.category || p.category.type !== categoryFilter) return false;
      }
      if (marketFilter && p.market.id !== marketFilter) return false;
      if (vendorFilter && p.vendor.displayName !== vendorFilter) return false;
      if (!Number.isNaN(min) && minPrice && p.price < min) return false;
      if (!Number.isNaN(max) && maxPrice && p.price > max) return false;
      return true;
    });
  }, [products, search, categoryFilter, marketFilter, vendorFilter, minPrice, maxPrice]);

  const visible = filtered.slice(0, visibleCount);

  const onEndReached = () => {
    if (visibleCount < filtered.length) {
      setVisibleCount((c) => c + 20);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await api.post("/cart/add", { productId, quantity: 1 });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  if (error && !products.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المنتجات</Text>
        <Text style={styles.headerSubtitle}>اكتشف مجموعة واسعة من المنتجات الطازجة</Text>
      </View>

      <View style={styles.filtersContainer}>
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

        <View style={styles.chipsRow}>
          <FilterChip
            label="الكل"
            selected={categoryFilter === "ALL"}
            onPress={() => setCategoryFilter("ALL")}
          />
          <FilterChip
            label="خضار"
            selected={categoryFilter === "VEGETABLE"}
            onPress={() => setCategoryFilter("VEGETABLE")}
          />
          <FilterChip
            label="فواكه"
            selected={categoryFilter === "FRUIT"}
            onPress={() => setCategoryFilter("FRUIT")}
          />
          <FilterChip
            label="تمور"
            selected={categoryFilter === "DATES"}
            onPress={() => setCategoryFilter("DATES")}
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.filterColumn}>
            <Text style={styles.filterLabel}>السوق</Text>
            <View style={styles.selectBox}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  !marketFilter && styles.selectOptionSelected,
                ]}
                onPress={() => setMarketFilter("")}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    !marketFilter && styles.selectOptionTextSelected,
                  ]}
                >
                  جميع الأسواق
                </Text>
              </TouchableOpacity>
              {markets.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.selectOption,
                    marketFilter === m.id && styles.selectOptionSelected,
                  ]}
                  onPress={() => setMarketFilter(m.id)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      marketFilter === m.id && styles.selectOptionTextSelected,
                    ]}
                  >
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterColumn}>
            <Text style={styles.filterLabel}>البائع</Text>
            <View style={styles.selectBox}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  !vendorFilter && styles.selectOptionSelected,
                ]}
                onPress={() => setVendorFilter("")}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    !vendorFilter && styles.selectOptionTextSelected,
                  ]}
                >
                  جميع البائعين
                </Text>
              </TouchableOpacity>
              {vendors.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.selectOption,
                    vendorFilter === v && styles.selectOptionSelected,
                  ]}
                  onPress={() => setVendorFilter(v)}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      vendorFilter === v && styles.selectOptionTextSelected,
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View style={styles.priceField}>
            <Text style={styles.filterLabel}>أدنى سعر</Text>
            <TextInput
              style={styles.priceInput}
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#9ca3af"
              textAlign="right"
            />
          </View>
          <View style={styles.priceField}>
            <Text style={styles.filterLabel}>أعلى سعر</Text>
            <TextInput
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="decimal-pad"
              placeholder="100"
              placeholderTextColor="#9ca3af"
              textAlign="right"
            />
          </View>
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        numColumns={grid ? 2 : 1}
        columnWrapperStyle={grid ? styles.gridRow : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 24,
        }}
        ListHeaderComponent={
          <>
            {topBanners.map((b) => (
              <BoosterBannerSlot
                key={b.id}
                title={b.title}
                description={b.description ?? undefined}
                ctaText={b.ctaText ?? undefined}
                imageUrl={b.imageUrl}
                placement="PRODUCT_TOP"
              />
            ))}
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد منتجات مطابقة لمعايير البحث.</Text>
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        renderItem={({ item, index }) => (
          <>
            {index > 0 && index % 8 === 0 && (
              <BoosterBannerSlot
                title="عروض على المنتجات المختارة"
                description="استفد من خصومات الأسواق المركزية"
                placement="PRODUCT_INLINE"
              />
            )}
            <View style={[styles.card, grid && styles.cardGrid]}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>بدون صورة</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>
                  {item.price} ر.س /{" "}
                  {item.unit === "KILO" ? "كيلو" : item.unit === "BOX" ? "صندوق" : "ربطة"}
                </Text>
                {item.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => void addToCart(item.id)}
              >
                <Text style={styles.addText}>إضافة إلى السلة</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      />
    </View>
  );
};

const FilterChip: React.FC<{ label: string; selected: boolean; onPress: () => void }> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      selected && { backgroundColor: theme.colors.primary },
    ]}
  >
    <Text
      style={[
        styles.chipText,
        selected && { color: "#ffffff" },
      ]}
    >
      {label}
    </Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  skeletonHeader: {
    height: 40,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  skeletonCard: {
    width: "48%",
    height: 160,
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
  },
  errorText: {
    color: theme.colors.error ?? "#dc2626",
    textAlign: "center",
  },
  filtersContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: theme.colors.background,
  },
  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
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
  chipsRow: {
    flexDirection: "row-reverse",
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 6,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  filtersRow: {
    flexDirection: "row-reverse",
    marginTop: 8,
  },
  filterColumn: {
    flex: 1,
    marginLeft: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: "right",
  },
  selectBox: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 4,
    backgroundColor: "#ffffff",
  },
  selectOption: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  selectOptionSelected: {
    backgroundColor: "#e5f9f0",
  },
  selectOptionText: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: "right",
  },
  selectOptionTextSelected: {
    fontWeight: "700",
    color: theme.colors.primary,
  },
  priceRow: {
    flexDirection: "row-reverse",
    marginTop: 6,
  },
  priceField: {
    flex: 1,
    marginLeft: 8,
  },
  priceInput: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },
  gridRow: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardGrid: {
    marginHorizontal: 4,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginBottom: 6,
  },
  imagePlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: theme.colors.muted,
  },
  cardContent: {
    paddingHorizontal: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.text,
  },
  price: {
    marginTop: 4,
    fontWeight: "700",
    fontSize: 13,
    color: theme.colors.primary,
    textAlign: "right",
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: "right",
    lineHeight: 16,
  },
  addBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  addText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 24,
    fontSize: 13,
    color: theme.colors.muted,
    textAlign: "center",
  },
});