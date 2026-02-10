import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "@theme/theme";
import { BoosterBannerSlot } from "@components/BoosterBannerSlot";
import { PopupModal } from "@components/PopupModal";
import { api } from "@api/client";

interface BannerDto {
  id: string;
  title: string;
  description?: string | null;
  ctaText?: string | null;
  imageUrl: string;
}

interface PopupDto {
  id: string;
  title: string;
  message?: string | null;
  imageUrl?: string | null;
  primaryCtaText?: string | null;
  secondaryCtaText?: string | null;
}

export const HomeScreen: React.FC = () => {
  const [heroBanners, setHeroBanners] = useState<BannerDto[]>([]);
  const [midBanners, setMidBanners] = useState<BannerDto[]>([]);
  const [popup, setPopup] = useState<PopupDto | null>(null);

  useEffect(() => {
    void (async () => {
      const [heroRes, midRes, popupRes] = await Promise.all([
        api.get<BannerDto[]>("/content/banners", { params: { placement: "HOME_HERO" } }),
        api.get<BannerDto[]>("/content/banners", { params: { placement: "HOME_MID" } }),
        api.get<PopupDto[]>("/content/popups"),
      ]);
      setHeroBanners(heroRes.data);
      setMidBanners(midRes.data);
      setPopup(popupRes.data[0] ?? null);
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
        {/* TODO: ربط بقائمة /catalog/featured-markets وعرض كروت الأسواق */}

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

const FeaturePill: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.featurePill}>
    <Text style={styles.featureText}>{label}</Text>
  </View>
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
    backgroundColor: "rgba(15,23,42,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },
  featureText: {
    color: "#e5e7eb",
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    color: theme.colors.text,
  },
});

