import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';

export const LanguageSwitcher = () => {
  const { toggleLanguage, t, isRTL } = useLanguage();

  return (
    <Pressable style={[styles.button, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} onPress={toggleLanguage}>
      <Text style={[styles.text, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('language.switch')}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  text: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 13,
  },
});
