import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner } from '@app-types/models';
import { api } from '@api/client';
import { theme } from '@theme/theme';

export const BannerCarousel = ({ banners }: { banners: Banner[] }) => {
  const source = banners
    .map((banner) => ({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: api.resolveAssetUrl(banner.imageUrl),
    }))
    .filter((banner) => Boolean(banner.imageUrl));

  if (!source.length) return null;

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.wrap}>
      {source.map((banner) => (
        <ImageBackground key={banner.id} source={{ uri: banner.imageUrl }} style={styles.slide} imageStyle={styles.image}>
          <View style={styles.overlay}>
            <Text style={styles.title}>{banner.title}</Text>
            {!!banner.description && <Text style={styles.desc}>{banner.description}</Text>}
          </View>
        </ImageBackground>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    maxHeight: 190,
  },
  slide: {
    width: 320,
    height: 180,
    marginLeft: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: theme.radius.lg,
  },
  overlay: {
    backgroundColor: 'rgba(5, 46, 22, 0.56)',
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  title: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  desc: {
    color: '#dcfce7',
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
  },
});
