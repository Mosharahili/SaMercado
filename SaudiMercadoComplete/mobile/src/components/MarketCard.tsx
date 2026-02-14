import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Market } from '@app-types/models';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';
import { theme } from '@theme/theme';

export const MarketCard = ({ market }: { market: Market; onBrowse?: () => void }) => {
  const { isRTL, tr } = useLanguage();
  const visualPad = React.useCallback((value: string) => (isRTL ? `\u200F\u061C\u00A0\u00A0${value}` : value), [isRTL]);
  const image = api.resolveAssetUrl(market.imageUrl);
  const textDirectionStyle = {
    writingDirection: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
    alignSelf: isRTL ? 'flex-end' : 'flex-start',
    width: '100%',
  } as const;
  const iconPositionStyle = isRTL ? styles.rowIconRTL : styles.rowIconLTR;
  const titlePaddingStyle = isRTL ? styles.titleRTL : styles.titleLTR;

  return (
    <View style={styles.card}>
      {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <View style={styles.placeholder} />}
      <View style={styles.row}>
        <MaterialCommunityIcons name="storefront-outline" size={26} color={theme.colors.primary} style={[styles.rowIcon, iconPositionStyle]} />
        <Text style={[styles.title, titlePaddingStyle, textDirectionStyle]}>{visualPad(market.name)}</Text>
      </View>
      <Text style={[styles.description, textDirectionStyle]}>
        {market.description ? visualPad(market.description) : tr('سوق موثوق بمنتجات طازجة وجودة يومية.', 'Trusted market with fresh daily quality products.')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
    ...theme.shadow.card,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#ecfdf3',
  },
  placeholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
  },
  row: {
    minHeight: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  rowIcon: {
    position: 'absolute',
    top: 1,
  },
  rowIconLTR: {
    left: 0,
  },
  rowIconRTL: {
    right: 0,
  },
  title: {
    flex: 1,
    fontWeight: '800',
    fontSize: 16,
    color: theme.colors.text,
  },
  titleLTR: {
    paddingLeft: 34,
  },
  titleRTL: {
    paddingRight: 34,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});
