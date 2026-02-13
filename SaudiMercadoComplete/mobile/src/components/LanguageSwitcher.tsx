import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';

export const LanguageSwitcher = () => {
  const { isRTL, toggleLanguage, t } = useLanguage();

  return (
    <Pressable style={[styles.button, isRTL ? styles.rtl : styles.ltr]} onPress={toggleLanguage}>
      <Text style={styles.text}>{t('language.switch')}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  rtl: {
    alignSelf: 'flex-end',
  },
  ltr: {
    alignSelf: 'flex-start',
  },
  text: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 13,
  },
});
