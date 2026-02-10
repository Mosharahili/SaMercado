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
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>اطلب خضارك وفواكهك</Text>
            <Text style={styles.heroSubtitle}>مباشرة من أسواق الرياض</Text>
            <Text style={styles.heroDescription}>جودة مضمونة • توصيل سريع • طازج يوميًا</Text>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>تصفح الأسواق</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroImagePlaceholder}>
            <Text style={styles.heroImageText}>🛒</Text>
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

        <Text style={styles.sectionTitle}>الأسواق</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    minHeight: 250,
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 8,
  },
  heroDescription: {
    color: "#e5e7eb",
    fontSize: 14,
    textAlign: "right",
    marginBottom: 20,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroButtonText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  heroImagePlaceholder: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 80,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  heroImageText: {
    fontSize: 40,
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
    marginTop: 32,
    marginHorizontal: 20,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.text,
    marginBottom: 16,
  },
  marketsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  marketCard: {
    width: 220,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  marketImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  marketImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: theme.colors.primarySoft,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  marketImageText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
  },
  marketContent: {
    padding: 16,
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

