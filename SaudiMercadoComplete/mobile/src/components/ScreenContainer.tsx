import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { useLanguage } from '@hooks/useLanguage';
import { theme } from '@theme/theme';

export const ScreenContainer = ({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) => {
  const { user } = useAuth();
  const { isRTL, t } = useLanguage();
  const route = useRoute();
  const navigation = useNavigation<any>();

  const isOwnerStoreScreen = typeof route.name === 'string' && route.name.startsWith('OwnerStore');
  const showOwnerBackToDashboard = user?.role === 'OWNER' && isOwnerStoreScreen;

  const ownerShortcut = showOwnerBackToDashboard ? (
    <Pressable style={[styles.ownerBackBtn, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} onPress={() => navigation.navigate('OwnerDashboard')}>
      <Text style={styles.ownerBackText}>{t('common.backToDashboard')}</Text>
    </Pressable>
  ) : null;

  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, { direction: isRTL ? 'rtl' : 'ltr' }, contentStyle]}>
      {ownerShortcut}
      {children}
    </ScrollView>
  ) : (
    <>
      {ownerShortcut}
      {children}
    </>
  );

  return (
    <LinearGradient colors={theme.gradients.app} style={styles.gradient}>
      <SafeAreaView style={[styles.safeArea, { direction: isRTL ? 'rtl' : 'ltr' }]}>{content}</SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  ownerBackBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ownerBackText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
