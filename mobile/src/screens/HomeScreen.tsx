import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "@theme/theme";
import { BoosterBannerSlot } from "@components/BoosterBannerSlot";
import { PopupModal } from "@components/PopupModal";
import { api } from "@api/client";

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

export const HomeScreen: React.FC = () => {
  const [heroBanners, setHeroBanners] = useState<BannerDto[]>([]);
  const [midBanners, setMidBanners] = useState<BannerDto[]>([]);
  const [popup, setPopup] = useState<PopupDto | null>(null);
  const [featuredMarkets, setFeaturedMarkets] = useState<Market[]>([]);

  useEffect(() => {
    void (async () => {
      const [heroRes, midRes, popupRes, marketsRes] = await Promise.all([
        api.get<BannerDto[]>("/content/banners", { params: { placement: "HOME_HERO" } }),
        api.get<BannerDto[]>("/content/banners", { params: { placement: "HOME_MID" } }),
        api.get<PopupDto[]>("/content/popups"),
        api.get<Market[]>("/catalog/featured-markets"),
      ]);
      setHeroBanners(heroRes.data);
      setMidBanners(midRes.data);
      setPopup(popupRes.data[0] ?? null);
      setFeaturedMarkets(marketsRes.data);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>اطلب خضارك وفواكهك مباشرة من السوق</Text>
          <Text style={styles.heroSubtitle}>أسواق الرياض بين يديك بجودة مضمونة وتوصيل سريع</Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>تصفح الأسواق</Text>
          </TouchableOpacity>
          <View style={styles.featuresRow}>
            <FeaturePill label="جودة مضمونة" />
            <FeaturePill label="توصيل سريع" />
            <FeaturePill label="طازج يوميًا" />
          </View>
        </LinearGradient>

        {heroBanners.map((b) => (
          <BoosterBannerSlot
            key={b.id}
            title={b.title}
            description={b.description ?? undefined}
            ctaText={b.ctaText ?? undefined}
            placement="HOME_HERO"
            imageUrl={b.imageUrl}
          />
        ))}

        <Text style={styles.sectionTitle}>الأسواق المميزة</Text>
        <FlatList
          horizontal
          data={featuredMarkets}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.marketsList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <MarketCard market={item} />}
        />

        {midBanners.map((b) => (
          <BoosterBannerSlot
            key={b.id}
            title={b.title}
            description={b.description ?? undefined}
            ctaText={b.ctaText ?? undefined}
            placement="HOME_MID"
            imageUrl={b.imageUrl}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {popup ? (
        <PopupModal
          visible={!!popup}
          title={popup.title}
          message={popup.message ?? undefined}
          imageUrl={popup.imageUrl ?? undefined}
          primaryCtaText={popup.primaryCtaText ?? undefined}
          secondaryCtaText={popup.secondaryCtaText ?? "لاحقًا"}
          onClose={() => setPopup(null)}
        />
      ) : null}
    </View>
  );
};

const MarketCard: React.FC<{ market: Market }> = ({ market }) => (
  <TouchableOpacity style={styles.marketCard}>
    {market.imageUrl ? (
      <Image source={{ uri: market.imageUrl }} style={styles.marketImage} />
    ) : (
      <View style={styles.marketImagePlaceholder}>
        <Text style={styles.marketImageText}>{market.name.charAt(0)}</Text>
      </View>
    )}
    <View style={styles.marketContent}>
      <Text style={styles.marketName}>{market.name}</Text>
      <Text style={styles.marketRegion}>{market.region}</Text>
      <Text style={styles.marketMeta}>{market.vendorCount} بائع</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  hero: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "right",
  },
  heroSubtitle: {
    marginTop: 8,
    color: "#e5e7eb",
    fontSize: 13,
    textAlign: "right",
  },
  heroButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroButtonText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  featuresRow: {
    flexDirection: "row-reverse",
    marginTop: 20,
  },
  featurePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },
  featurePillText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  sectionTitle: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.text,
  },
  marketsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  marketCard: {
    width: 160,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marketImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  marketImagePlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: theme.colors.primarySoft,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  marketImageText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  marketContent: {
    padding: 12,
  },
  marketName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "right",
  },
  marketRegion: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: "right",
  },
  marketMeta: {
    marginTop: 4,
    fontSize: 11,
    color: theme.colors.primary,
    textAlign: "right",
  },
});

const FeaturePill: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.featurePill}>
    <Text style={styles.featurePillText}>{label}</Text>
  </View>
);

