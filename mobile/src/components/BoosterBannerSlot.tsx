import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "@theme/theme";

export interface BoosterBannerProps {
  title: string;
  description?: string;
  ctaText?: string;
  imageUrl?: string;
  placement: "HOME_HERO" | "HOME_MID" | "PRODUCT_TOP" | "PRODUCT_INLINE";
  onPress?: () => void;
}

export const BoosterBannerSlot: React.FC<BoosterBannerProps> = ({
  title,
  description,
  ctaText,
  imageUrl,
  placement,
  onPress,
}) => {
  const isHero = placement === "HOME_HERO";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, isHero && styles.heroContainer]}
    >
      <LinearGradient
        colors={[theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.contentRow}>
          <View style={styles.textColumn}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {ctaText ? <Text style={styles.cta}>{ctaText}</Text> : null}
          </View>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  heroContainer: {
    marginTop: 16,
  },
  gradient: {
    padding: 16,
  },
  contentRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  textColumn: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  description: {
    color: "#e5e7eb",
    marginTop: 4,
    fontSize: 13,
    textAlign: "right",
  },
  cta: {
    marginTop: 8,
    color: "#bbf7d0",
    fontWeight: "600",
    textAlign: "right",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginLeft: 8,
  },
});

